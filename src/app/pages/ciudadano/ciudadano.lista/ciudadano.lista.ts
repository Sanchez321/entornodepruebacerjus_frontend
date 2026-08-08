import { Component, OnInit, inject, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms'
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CiudadanoService } from '../services/ciudadano.service';
import { VMCiudadanoListaSimple,VMCiudadanoReporteTablaOptions } from '../models/ciudadano.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { Subscription } from 'rxjs';
import { PageMetaService } from '@/app/services/page_meta.service';
import { AuthStore } from '@/app/auth/auth.store';
import {REPORTE_ESTADO_OPCIONES,REPORTE_FORMATO_OPCIONES,REPORTE_MES_OPCIONES,REPORTE_MODO_OPCIONES,ReporteEstado,ReporteFormato,
  ReporteModo,canSeeReporteOption,reporteModoFuerzaActivos,} from '../models/ciudadano.dominio';

@Component({
  selector: 'app-ciudadano-lista',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ciudadano.lista.html',
  styleUrl: './ciudadano.lista.css'
})
export class CiudadanoLista implements OnInit, OnDestroy {
  downloading = false;
  guardarDrive = false;
  showExportModal = false;

  private subExportForm = new Subscription();

  readonly formatoReporteOpciones = REPORTE_FORMATO_OPCIONES;
  readonly mesReporteOpciones = REPORTE_MES_OPCIONES;

  userLevel: number | null = null;
  /* Inyección */
  private fb = inject(FormBuilder);
  private service = inject(CiudadanoService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);
  private subForm?: Subscription;
  private auth = inject(AuthStore);
  /* Formulario de búsqueda */
  form = this.fb.group({
    id: [null],
    dni: [''],
    apellidoPaterno: [''],
    apellidoMaterno: [''],
    nombres: [''],
    nacionalidad: [''],
  })

  /* Estado de datos / UI visibles */
  items: VMCiudadanoListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 9;

  loading = false;
  showOverlay = false;

  // Anti-flicker
  firstLoad = true;     // skeleton solo en primera carga
  showEmpty = false;    // "No se encontraron resultados" solo cuando !loading

  // Paginación “mostrada” (desacoplada)
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;
  
  
  // PENDIENTES (se promueven al final de cada carga)
  private pendItems: VMCiudadanoListaSimple[] = [];
  private pendTotal = 0;
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;

  /* Timers / medidas */
  private reqSeq = 0;
  private overlayTimer: any;
  private emptyTimer: any;           // ya no lo usaremos, pero lo mantenemos por si lo necesitas
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;        // ms antes de mostrar overlay (cargas posteriores)
  private readonly minOverlayMs = 220;        // ms mínimos visible si se mostró overlay
  private readonly firstSkeletonMinMs = 200;  // ms mínimos de skeleton en 1ª carga

  /* Layout helpers (alineado con CSS) */
  headerBlockPx = 96;                         // alto estimado thead + filtros
  get listMinHeight(): number {               // 96 + N*48px (ajuste fino según su tema)
    return this.headerBlockPx + this.pageSize * 48;
  }
  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }
  get lastPage(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
  }

  /** Reserva visual en ch (para paginación) */
  rangeReserveCh = 9;   // “888–888” ≈ 9ch
  totalReserveCh = 7;   // ajuste según máximos esperados

  /* Ciclo de vida */
  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Lista de Ciudadanos',
    });

    this.load();
    this.userLevel = this.auth.getLevel();
    this.subExportForm.add(
      this.exportForm.get('modo')!.valueChanges.subscribe(() => {
        this.syncEstadoReporte();
      }),
    );

    this.syncModoReporteInicial();
    this.syncEstadoReporte();
    this.subForm = this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
  }
  ngOnDestroy(): void {
    this.subForm?.unsubscribe();
    this.subExportForm.unsubscribe();
    this.cancelTimers();
    this.pageMeta.clear();
  }
  /* Acciones */
  clear() {
    this.form.reset({
      id: null,
      dni: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: '',
      nacionalidad: '',
    });
    this.page = 1;
    this.load();
  }

  goTo(page: number) {
    if (page < 1) return;
    const last = this.lastPage;
    if (last && page > last) return;
    this.page = page;
    this.load();
  }

  /* Carga con anti-flicker */
  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
    clearTimeout(this.emptyTimer);
  }

  load(): void {
    this.loading = true;
    this.cancelTimers();
    const myReq = ++this.reqSeq;

    // Ocultar estado vacío al iniciar nueva búsqueda
    this.showEmpty = false;

    // 1ª carga: sin overlay; posteriores: overlay diferido
    if (!this.firstLoad) {
      this.overlayTimer = setTimeout(() => {
        if (this.reqSeq === myReq) {
          this.showOverlay = true;
          this.overlayShownAt = performance.now();
        }
      }, this.overlayDelay);
    } else {
      this.firstPaintStart = performance.now();
      this.showOverlay = false;
    }

    const v = this.form.value;
    this.service.list({
      page: this.page,
      pageSize: this.pageSize,
      id: v.id || undefined,
      dni: v.dni || undefined,
      apellidoPaterno: v.apellidoPaterno || undefined,
      apellidoMaterno: v.apellidoMaterno || undefined,
      nombres: v.nombres || undefined,
      nacionalidad: v.nacionalidad || undefined,
    })
    .subscribe({
      next: (res) => {
        if (myReq !== this.reqSeq) return; // respuesta vieja → ignorar

        const incoming = res.items ?? [];
        const total = res.total ?? incoming.length;

        // NO tocar this.items aquí. Solo calcular pendientes.
        const from = incoming.length > 0 ? (this.page - 1) * this.pageSize + 1 : 0;
        const to = (this.page - 1) * this.pageSize + incoming.length;
        const last = this.pageSize ? Math.max(1, Math.ceil(total / this.pageSize)) : 1;

        this.pendItems = incoming;
        this.pendTotal = total;
        this.pendFrom = from;
        this.pendTo = to;
        this.pendPage = this.page;
        this.pendLastPage = last;

        this.finishLoadingWithOverlayMin();
      },
      error: () => {
        if (myReq !== this.reqSeq) return;

        // En error no vaciamos items (evita destello).
        // Dejamos pend* con lo ya mostrado:
        this.pendItems = this.items;
        this.pendTotal = this.total;
        this.pendFrom = this.shownFrom;
        this.pendTo = this.shownTo;
        this.pendPage = this.shownPage || this.page;
        this.pendLastPage = this.shownLastPage || this.lastPage;

        this.finishLoadingWithOverlayMin();
      }
    });
  }

  private finishLoadingWithOverlayMin(): void {
    const complete = () => {
      this.loading = false;
      clearTimeout(this.overlayTimer);

      if (this.showOverlay) {
        const elapsed = performance.now() - this.overlayShownAt;
        const remain = Math.max(0, this.minOverlayMs - elapsed);
        setTimeout(() => (this.showOverlay = false), remain);
      } else {
        this.showOverlay = false;
      }

      // Promover pendientes a “mostrados” (un solo momento)
      this.items = this.pendItems;
      this.total = this.pendTotal;
      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

      // Decidir "vacío" SOLO ahora (y nunca durante la carga)
      this.showEmpty = this.items.length === 0;

      // Cerrar primera carga respetando el mínimo de skeleton
      if (this.firstLoad) {
        this.firstLoad = false;
      }
    };

    if (this.firstLoad) {
      const elapsed = performance.now() - this.firstPaintStart;
      const remain = Math.max(0, this.firstSkeletonMinMs - elapsed);
      setTimeout(complete, remain);   // esperar el mínimo de skeleton en 1ª carga
    } else {
      complete();                     // inmediato en cargas posteriores
    }
  }

  /* Utilidades */
  get lastPageCalc(): number {
    return this.lastPage; // alias si lo prefiere en plantillas
  }

  trackById(_index: number, item: VMCiudadanoListaSimple) {
    return item.id;
  }

  exportForm = this.fb.group({
    formato: new FormControl<ReporteFormato>('xlsx', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    modo: new FormControl<ReporteModo>('ASESOR', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    estado: new FormControl<ReporteEstado>('ACTIVOS', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    anio: new FormControl(new Date().getFullYear(), {
      nonNullable: true,
      validators: [Validators.required, Validators.min(2000), Validators.max(2100)],
    }),

    mes: new FormControl(new Date().getMonth() + 1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(12)],
    }),
  });

  get modoReporteOpciones() {
    return REPORTE_MODO_OPCIONES.filter(o =>
      canSeeReporteOption(this.userLevel, o.minLevel),
    );
  }

  get estadoReporteOpciones() {
    return REPORTE_ESTADO_OPCIONES.filter(o =>
      canSeeReporteOption(this.userLevel, o.minLevel),
    );
  }

  get estadoForzadoActivo(): boolean {
    return reporteModoFuerzaActivos(this.exportForm.get('modo')!.value);
  }
  
  abrirModalExportacion(): void {
    this.showExportModal = true;
    this.syncModoReporteInicial();
    this.syncEstadoReporte();
  }

  cerrarModalExportacion(): void {
    if (this.downloading) return;
    this.showExportModal = false;
  }

  private syncModoReporteInicial(): void {
    const modoCtrl = this.exportForm.get('modo')!;
    const current = modoCtrl.value;

    const permitido = this.modoReporteOpciones.some(o => o.value === current);

    if (!permitido) {
      modoCtrl.setValue('ASESOR', { emitEvent: false });
    }
  }

  private syncEstadoReporte(): void {
    const estadoCtrl = this.exportForm.get('estado')!;

    if (this.estadoForzadoActivo) {
      estadoCtrl.setValue('ACTIVOS', { emitEvent: false });
      estadoCtrl.disable({ emitEvent: false });
      return;
    }

    estadoCtrl.enable({ emitEvent: false });

    const current = estadoCtrl.value;
    const permitido = this.estadoReporteOpciones.some(o => o.value === current);

    if (!permitido) {
      estadoCtrl.setValue('ACTIVOS', { emitEvent: false });
    }
  }

  async descargarCiudadanosTabla(): Promise<void> {
    if (this.downloading) return;

    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();

      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Seleccione correctamente las opciones de exportación.',
        primaryText: 'Aceptar',
      });

      return;
    }

    const v = this.exportForm.getRawValue();

    const opts: VMCiudadanoReporteTablaOptions = {
      formato: v.formato,
      modo: v.modo,
      estado: v.estado,
      anio: v.anio,
      mes: v.mes,
    };

    this.downloading = true;

    try {
      const result = await this.service.descargarCiudadanosTabla(
        opts,
        this.guardarDrive,
      );

      this.showExportModal = false;
      await this.mostrarResultadoExportacion(result);
    } catch {
      await this.notify.ok({
        variant: 'warning',
        title: 'No se pudo descargar',
        message: 'No se pudo generar el archivo de ciudadanos.',
        primaryText: 'Aceptar',
      });
    } finally {
      this.downloading = false;
    }
  }

  private async mostrarResultadoExportacion(result: {
    driveStatus: string | null;
    driveMessage: string | null;
  }): Promise<void> {
    if (!this.guardarDrive) {
      await this.notify.ok({
        variant: 'success',
        title: 'Descarga iniciada',
        message: 'El archivo de ciudadanos se generó correctamente.',
        primaryText: 'Aceptar',
      });
      return;
    }

    if (result.driveStatus === 'SAVED') {
      await this.notify.ok({
        variant: 'success',
        title: 'Reporte generado',
        message: 'El reporte se descargó y también se guardó en Drive.',
        primaryText: 'Aceptar',
      });
      return;
    }

    await this.notify.ok({
      variant: 'warning',
      title: 'Descarga completada',
      message:
        result.driveStatus === 'FAILED'
          ? `El reporte se descargó, pero falló el guardado en Drive.${result.driveMessage ? ` ${result.driveMessage}` : ''}`
          : 'El reporte se descargó, pero el servidor no confirmó el guardado en Drive.',
      primaryText: 'Aceptar',
    });
  }

}
