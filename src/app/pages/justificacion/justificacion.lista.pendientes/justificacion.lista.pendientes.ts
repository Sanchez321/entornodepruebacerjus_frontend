import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';
import {
  AJ_ESTADO_OPCIONES,
  AJ_TIPO_OPCIONES,
  AsistenciaJustificacionEstadoFiltro,
  AsistenciaJustificacionTipoFiltro,
  estadoBadgeClass,
} from '../models/justificacion.dominio';
import {
  VMAsistenciaJustificacionItem,
  VMAsistenciaJustificacionResumen,
} from '../models/justificacion.vm';
import { JustificacionService } from '../services/justificacion.service';

@Component({
  selector: 'app-justificacion-lista-pendientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './justificacion.lista.pendientes.html',
  styleUrl: './justificacion.lista.pendientes.css',
})
export class JustificacionListaPendientes implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(JustificacionService);
  private readonly notify = inject(NotificacionesService);
  private readonly pageMeta = inject(PageMetaService);

  readonly estadoOpciones = AJ_ESTADO_OPCIONES;
  readonly tipoOpciones = AJ_TIPO_OPCIONES;
  readonly skeletonCards = [0, 1, 2];

  form = this.fb.group({
    us_id: new FormControl<number | null>(null),
    desde: new FormControl<string>(''),
    hasta: new FormControl<string>(''),
    tipo: new FormControl<AsistenciaJustificacionTipoFiltro>(''),
    estado: new FormControl<AsistenciaJustificacionEstadoFiltro>('PENDIENTE'),
  });

  items: VMAsistenciaJustificacionItem[] = [];
  resumen: VMAsistenciaJustificacionResumen | null = null;
  total = 0;
  page = 1;
  pageSize = 9;
  loading = false;
  firstLoad = true;

  decisionOpen = false;
  decisionMode: 'APROBAR' | 'RECHAZAR' = 'APROBAR';
  decisionItem: VMAsistenciaJustificacionItem | null = null;
  decisionForm = this.fb.group({
    motivo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
  });

  private subForm?: Subscription;

  get lastPage(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get pageFrom(): number {
    return this.total ? (this.page - 1) * this.pageSize + 1 : 0;
  }

  get pageTo(): number {
    return Math.min(this.total, this.page * this.pageSize);
  }

  ngOnInit(): void {
    this.pageMeta.replace({ titulo: 'Justificaciones pendientes' });
    this.load();

    this.subForm = this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
  }

  ngOnDestroy(): void {
    this.subForm?.unsubscribe();
    this.pageMeta.clear();
  }

  clear(): void {
    this.form.reset({
      us_id: null,
      desde: '',
      hasta: '',
      tipo: '',
      estado: 'PENDIENTE',
    });
    this.page = 1;
    this.load();
  }

  goTo(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.load();
  }

  estadoClass(estado: any): string {
    return estadoBadgeClass(estado);
  }

  abrirDecision(
    mode: 'APROBAR' | 'RECHAZAR',
    item: VMAsistenciaJustificacionItem,
  ): void {
    this.decisionMode = mode;
    this.decisionItem = item;
    this.decisionForm.reset({ motivo: '' });
    this.decisionOpen = true;
  }

  cerrarDecision(): void {
    this.decisionOpen = false;
    this.decisionItem = null;
  }

  async confirmarDecision(): Promise<void> {
    if (!this.decisionItem) return;

    if (this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      await this.notify.ok({
        variant: 'warning',
        title: 'Falta el motivo',
        message: 'Ingrese el motivo de la decisión.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const reason = this.decisionForm.getRawValue().motivo;

    try {
      if (this.decisionMode === 'APROBAR') {
        await this.service.aprobar(this.decisionItem.aj_ID, reason);
      } else {
        await this.service.rechazar(this.decisionItem.aj_ID, reason);
      }

      await this.notify.ok({
        variant: 'success',
        title:
          this.decisionMode === 'APROBAR'
            ? 'Justificación aprobada'
            : 'Justificación rechazada',
        message: 'La decisión fue registrada correctamente.',
        primaryText: 'Aceptar',
      });

      this.cerrarDecision();
      this.load();
    } catch {
      // El interceptor muestra el error.
    }
  }

  trackById(_index: number, item: VMAsistenciaJustificacionItem): number {
    return item.aj_ID;
  }

  private load(): void {
    this.loading = true;
    const value = this.form.getRawValue();
    const filters = {
      us_id: value.us_id ?? undefined,
      desde: value.desde || undefined,
      hasta: value.hasta || undefined,
      tipo: value.tipo || undefined,
      estado: value.estado || undefined,
    };

    forkJoin({
      page: this.service.listPendientes({
        ...filters,
        page: this.page,
        pageSize: this.pageSize,
      }),
      summary: this.service.getResumen(filters),
    }).subscribe({
      next: ({ page, summary }) => {
        this.items = page.items;
        this.total = page.total;
        this.page = page.page;
        this.pageSize = page.pageSize;
        this.resumen = summary;
        this.loading = false;
        this.firstLoad = false;
      },
      error: () => {
        this.loading = false;
        this.firstLoad = false;
      },
    });
  }
}
