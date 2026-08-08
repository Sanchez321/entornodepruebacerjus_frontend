import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';
import {
  VMAsistenciaListaSimple,
  VMMiHorarioHoy,
} from '../models/asistencia.vm';
import { AsistenciaService } from '../services/asistencia.service';

@Component({
  selector: 'app-asistencia-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asistencia.lista.html',
  styleUrl: './asistencia.lista.css',
})
export class AsistenciaLista implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AsistenciaService);
  private readonly notify = inject(NotificacionesService);
  private readonly pageMeta = inject(PageMetaService);

  form = this.fb.group({});

  horarioHoy: VMMiHorarioHoy | null = null;
  items: VMAsistenciaListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 7;

  loading = false;
  loadingHorario = false;
  marcando = false;
  showOverlay = false;
  firstLoad = true;
  showEmpty = false;

  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  private pendItems: VMAsistenciaListaSimple[] = [];
  private pendTotal = 0;
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;

  private reqSeq = 0;
  private overlayTimer: ReturnType<typeof setTimeout> | undefined;
  private overlayShownAt = 0;
  private firstPaintStart = 0;
  private subForm?: Subscription;

  private readonly overlayDelay = 180;
  private readonly minOverlayMs = 220;
  private readonly firstSkeletonMinMs = 200;

  headerBlockPx = 48;
  rangeReserveCh = 9;
  totalReserveCh = 7;

  get listMinHeight(): number {
    return this.headerBlockPx + this.pageSize * 48;
  }

  get skeletonRows(): number[] {
    return Array.from(
      { length: this.pageSize },
      (_, index) => index,
    );
  }

  get lastPage(): number {
    return this.pageSize
      ? Math.max(1, Math.ceil(this.total / this.pageSize))
      : 1;
  }

  get puedeMarcarEntrada(): boolean {
    return !!this.horarioHoy?.puedeMarcarEntrada;
  }

  get puedeMarcarSalida(): boolean {
    return !!this.horarioHoy?.puedeMarcarSalida;
  }

  get puedeCorregirSalida(): boolean {
    return !!this.horarioHoy?.puedeCorregirSalida;
  }

  get horarioEstadoClass(): string {
    if (!this.horarioHoy?.programado) return 'schedule-status-muted';
    if (this.horarioHoy.asistencia?.estado === 1) return 'schedule-status-ok';
    if (this.horarioHoy.asistencia) return 'schedule-status-warn';
    return 'schedule-status-info';
  }

  ngOnInit(): void {
    this.pageMeta.replace({ titulo: 'Asistencia' });
    this.load();

    this.subForm = this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (a, b) => JSON.stringify(a) === JSON.stringify(b),
        ),
      )
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
  }

  ngOnDestroy(): void {
    this.subForm?.unsubscribe();
    this.cancelTimers();
    this.pageMeta.clear();
  }

  clear(): void {
    this.form.reset({});
    this.page = 1;
    this.load();
  }

  goTo(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadingHorario = true;
    this.cancelTimers();

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

    forkJoin({
      page: this.service.list({
        page: this.page,
        pageSize: this.pageSize,
        sort: 'ma_fecha:desc',
      }),
      horario: this.service
        .getMiHorarioHoy()
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ page, horario }) => {
        if (myReq !== this.reqSeq) return;

        const incoming = page.items ?? [];
        const total = page.total ?? incoming.length;
        const from = incoming.length
          ? (this.page - 1) * this.pageSize + 1
          : 0;
        const to =
          (this.page - 1) * this.pageSize + incoming.length;
        const last = this.pageSize
          ? Math.max(1, Math.ceil(total / this.pageSize))
          : 1;

        this.horarioHoy = horario;
        this.loadingHorario = false;
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

        this.loadingHorario = false;
        this.pendItems = this.items;
        this.pendTotal = this.total;
        this.pendFrom = this.shownFrom;
        this.pendTo = this.shownTo;
        this.pendPage = this.shownPage || this.page;
        this.pendLastPage =
          this.shownLastPage || this.lastPage;

        this.finishLoadingWithOverlayMin();
      },
    });
  }

  marcarEntrada(): void {
    if (this.marcando || !this.puedeMarcarEntrada) return;

    this.marcando = true;
    this.service.marcarEntrada().subscribe({
      next: async (response) => {
        this.marcando = false;
        await this.notify.ok({
          variant: 'success',
          title: 'Entrada registrada',
          message:
            response.message ||
            'Se registró la entrada correctamente.',
          primaryText: 'Aceptar',
        });
        this.load();
      },
      error: () => {
        this.marcando = false;
      },
    });
  }

  marcarSalida(): void {
    if (this.marcando || !this.puedeMarcarSalida) return;

    this.marcando = true;
    this.service.marcarSalida().subscribe({
      next: async (response) => {
        this.marcando = false;
        await this.notify.ok({
          variant: 'success',
          title: 'Salida registrada',
          message:
            response.message ||
            'Se registró la salida correctamente.',
          primaryText: 'Aceptar',
        });
        this.load();
      },
      error: () => {
        this.marcando = false;
      },
    });
  }

  async corregirSalida(): Promise<void> {
    if (this.marcando || !this.puedeCorregirSalida) return;

    const confirmed = await this.notify.confirm({
      variant: 'warning',
      title: 'Actualizar salida',
      message:
        'La hora de salida actual será reemplazada por la hora de este momento. La hora anterior quedará guardada en el historial de correcciones. ¿Deseas continuar?',
      confirmText: 'Actualizar salida',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    this.marcando = true;
    this.service
      .corregirSalida({
        motivo:
          'Actualización de salida marcada antes de tiempo por el usuario.',
      })
      .subscribe({
        next: async (response) => {
          this.marcando = false;
          await this.notify.ok({
            variant: 'success',
            title: 'Salida actualizada',
            message:
              response.message ||
              'La hora de salida fue actualizada correctamente.',
            primaryText: 'Aceptar',
          });
          this.load();
        },
        error: () => {
          this.marcando = false;
        },
      });
  }

  goJustificaciones(): void {
    this.router.navigate(['/asistencia/justificacion/mis']);
  }

  trackById(
    _index: number,
    item: VMAsistenciaListaSimple,
  ): string {
    return `${item.idmarcaasistencia}-${item.idmarca}`;
  }

  private finishLoadingWithOverlayMin(): void {
    const complete = () => {
      this.loading = false;
      this.cancelTimers();

      if (this.showOverlay) {
        const elapsed =
          performance.now() - this.overlayShownAt;
        const remain = Math.max(
          0,
          this.minOverlayMs - elapsed,
        );
        setTimeout(
          () => (this.showOverlay = false),
          remain,
        );
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
      this.firstLoad = false;
    };

    if (this.firstLoad) {
      const elapsed =
        performance.now() - this.firstPaintStart;
      setTimeout(
        complete,
        Math.max(
          0,
          this.firstSkeletonMinMs - elapsed,
        ),
      );
    } else {
      complete();
    }
  }

  private cancelTimers(): void {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
    }
  }
}
