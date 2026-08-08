import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConsultaService } from '../services/consulta.service';
import { VMConsultaListaGeneralSimple, VMConsultaReporteTablaOptions, } from '../models/consulta.vm';
import {Materia,MATERIA_CONSULTA_OPCIONES,LLEVA_CASO_OPCIONES,LlevaCasoConNosotros,REPORTE_ESTADO_OPCIONES,REPORTE_FORMATO_OPCIONES,
  REPORTE_MES_OPCIONES,REPORTE_MODO_OPCIONES,ReporteEstado,ReporteFormato,ReporteModo,canSeeReporteOption,reporteModoFuerzaActivos,
  } from '../models/consulta.dominio';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { Subscription } from 'rxjs';
import { PageMetaService } from '@/app/services/page_meta.service';
import { AuthStore } from '@/app/auth/auth.store';

@Component({
  selector: 'app-consulta-lista',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './consulta.lista.html', 
  styleUrl: './consulta.lista.css'
})
export class ConsultaLista implements OnInit ,OnDestroy {
    private fb = inject(FormBuilder);
    private service = inject(ConsultaService);
    private notify = inject(NotificacionesService);
    private pageMeta = inject(PageMetaService);
    private subForm = new Subscription();

    private auth = inject(AuthStore);

    downloading = false;
    guardarDrive = false;
    showExportModal = false;
    userLevel: number | null = null;

    private subExportForm = new Subscription();

    readonly formatoReporteOpciones = REPORTE_FORMATO_OPCIONES;
    readonly mesReporteOpciones = REPORTE_MES_OPCIONES;

    readonly materiaOpciones = MATERIA_CONSULTA_OPCIONES;
    readonly llevaCasoOpciones = LLEVA_CASO_OPCIONES;
    get isOtros(): boolean {
        return this.form.get('materias')!.value === 'OTROS';
    }

    form = this.fb.group({
        id: [null],
        dni: [''],
        materias: ['' as Materia],
        materiaOtros: [{ value: '', disabled: true }],
        llevaCaso: ['' as '' | LlevaCasoConNosotros],
        });

    items: VMConsultaListaGeneralSimple[] = [];
    total = 0;
    page = 1;
    pageSize = 9;

    loading = false;
    showOverlay = false;

    firstLoad = true;
    showEmpty = false;

    shownFrom = 0;
    shownTo = 0;
    shownPage = 1;
    shownLastPage = 1;
    shownTotal = 0;

    private pendItems: VMConsultaListaGeneralSimple[] = [];
    private pendTotal = 0;
    private pendFrom = 0;
    private pendTo = 0;
    private pendPage = 1;
    private pendLastPage = 1;

    private reqSeq = 0;
    private overlayTimer: any;
    private emptyTimer: any;
    private overlayShownAt = 0;
    private firstPaintStart = 0;

    private readonly overlayDelay = 180;
    private readonly minOverlayMs = 220;
    private readonly firstSkeletonMinMs = 200;

    headerBlockPx = 96;

    get listMinHeight(): number {
        return this.headerBlockPx + this.pageSize * 48;
    }

    get skeletonRows(): number[] {
        return Array.from({ length: this.pageSize }, (_, i) => i);
    }

    get lastPage(): number {
        return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
    }

    rangeReserveCh = 9;
    totalReserveCh = 7;

    ngOnInit(): void {
        this.pageMeta.replace({
            titulo: 'Lista de Consultas',
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

        this.subForm.add(
            this.form.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
            )
            .subscribe(() => {
                this.page = 1;
                this.load();
            })
        );

        this.subForm.add(
            this.form.get('materias')!.valueChanges.subscribe(() => {
            this.syncMateriaOtros();
            })
        );

        this.syncMateriaOtros();
    }
    ngOnDestroy(): void {
        this.subForm.unsubscribe();
        this.subExportForm.unsubscribe();
        this.cancelTimers();
        this.pageMeta.clear();
    }

    clear() {
        this.form.reset({
            id: null,
            dni: '',
            materias: '',
            materiaOtros: '',
            llevaCaso: '',
        });

        this.form.get('materiaOtros')!.disable({ emitEvent: false });

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

    private cancelTimers(): void {
        clearTimeout(this.overlayTimer);
        clearTimeout(this.emptyTimer);
    }

    load(): void {
        this.loading = true;
        this.cancelTimers();
        this.syncMateriaOtros();
        const myReq = ++this.reqSeq;
        this.showEmpty = false;

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
            materias: v.materias || undefined,
            materiaOtros: v.materiaOtros || undefined,
            llevaCaso: v.llevaCaso || undefined,
        })
        .subscribe({
        next: (res) => {
            if (myReq !== this.reqSeq) return;

            const incoming = res.items ?? [];
            const total = res.total ?? incoming.length;

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

        this.items = this.pendItems;
        this.total = this.pendTotal;
        this.shownFrom = this.pendFrom;
        this.shownTo = this.pendTo;
        this.shownPage = this.pendPage;
        this.shownLastPage = this.pendLastPage;
        this.shownTotal = this.pendTotal;

        this.showEmpty = this.items.length === 0;

        if (this.firstLoad) {
            this.firstLoad = false;
        }
        };

        if (this.firstLoad) {
        const elapsed = performance.now() - this.firstPaintStart;
        const remain = Math.max(0, this.firstSkeletonMinMs - elapsed);
        setTimeout(complete, remain);
        } else {
        complete();
        }
    }

    get lastPageCalc(): number {
        return this.lastPage;
    }

    trackById(_index: number, item: VMConsultaListaGeneralSimple) {
        return item.id;
    }

    private syncMateriaOtros(): void {
        const value = this.form.get('materias')!.value as Materia;
        const otrosCtrl = this.form.get('materiaOtros')!;

        if (value === 'OTROS') {
            otrosCtrl.enable({ emitEvent: false });
        } else {
            otrosCtrl.setValue('', { emitEvent: false });
            otrosCtrl.disable({ emitEvent: false });
        }

        otrosCtrl.updateValueAndValidity({ emitEvent: false });
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

    async descargarConsultasTabla(): Promise<void> {
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

      const opts: VMConsultaReporteTablaOptions = {
        formato: v.formato,
        modo: v.modo,
        estado: v.estado,
        anio: v.anio,
        mes: v.mes,
      };

      this.downloading = true;

      try {
        const result = await this.service.descargarConsultasTabla(
          opts,
          this.guardarDrive,
        );

        this.showExportModal = false;
        await this.mostrarResultadoExportacion(result);
      } catch {
        await this.notify.ok({
          variant: 'warning',
          title: 'No se pudo descargar',
          message: 'No se pudo generar el archivo de consultas.',
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
          message: 'El archivo de consultas se generó correctamente.',
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