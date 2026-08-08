// src/app/pages/documentos/documentos.lista.general/documentos.lista.general.ts

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { DocumentosService } from '../services/documentos.service';
import { VMDocumentoListaSimple } from '../models/documentos.vm';

import {DOCUMENTO_TIPO_OPCIONES,DOCUMENTO_RUTA_BASE_ESTADO_OPCIONES,} from '../models/documentos.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-documentos-lista-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './documentos.lista.general.html',
  styleUrl: './documentos.lista.general.css',
})
export class DocumentosListaGeneral implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private service = inject(DocumentosService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  private subForm = new Subscription();

  readonly tipoOpciones = DOCUMENTO_TIPO_OPCIONES;
  readonly estadoOpciones = DOCUMENTO_RUTA_BASE_ESTADO_OPCIONES;

  form = this.fb.group({
    id: [''],
    q: [''],
    entidadTipo: [''],
    entidadId: [''],
    ciudadanoDni: [''],
    categoria: [''],
    extension: [''],
    fechaDesde: [''],
    fechaHasta: [''],
    estado: [1 as number | null],
  });

  items: VMDocumentoListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 10;

  loading = false;
  showOverlay = false;

  firstLoad = true;
  showEmpty = false;

  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  private pendItems: VMDocumentoListaSimple[] = [];
  private pendTotal = 0;
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;

  private reqSeq = 0;
  private overlayTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;
  private readonly minOverlayMs = 220;
  private readonly firstSkeletonMinMs = 200;

  headerBlockPx = 132;

  get listMinHeight(): number {
    return this.headerBlockPx + this.pageSize * 48;
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }

  get lastPage(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
  }

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Documentos',
    });

    this.load();

    this.subForm.add(
      this.form.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        )
        .subscribe(() => {
          this.page = 1;
          this.load();
        }),
    );
  }

  ngOnDestroy(): void {
    this.subForm.unsubscribe();
    this.cancelTimers();
    this.pageMeta.clear();
  }

  clear(): void {
    this.form.reset({
      id: '',
      q: '',
      entidadTipo: '',
      entidadId: '',
      ciudadanoDni: '',
      categoria: '',
      extension: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: 1,
    });

    this.page = 1;
    this.load();
  }

  goTo(page: number): void {
    if (page < 1) return;

    const last = this.lastPage;
    if (last && page > last) return;

    this.page = page;
    this.load();
  }

  abrirDocumento(item: VMDocumentoListaSimple): void {
    try {
      this.service.abrirDocumento(item);
    } catch {
      this.notify.ok({
        variant: 'warning',
        title: 'Documento no disponible',
        message: 'El documento no tiene enlace de visualización.',
        primaryText: 'Aceptar',
      });
    }
  }

  async eliminarDocumento(item: VMDocumentoListaSimple): Promise<void> {
    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Eliminar documento',
      message: `¿Deseas eliminar el documento "${item.nombreOriginal}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    try {
      await this.service.eliminarDocumento(item.id);

      await this.notify.ok({
        variant: 'success',
        title: 'Documento eliminado',
        message: 'El documento fue eliminado correctamente.',
        primaryText: 'Aceptar',
      });

      this.load();
    } catch {
      // El interceptor ya mostró el error.
    }
  }

  estadoTexto(estado: number | null | undefined): string {
    switch (estado) {
      case 1:
        return 'Activo';
      case 0:
        return 'Eliminado';
      default:
        return '—';
    }
  }

  estadoBadgeClass(estado: number | null | undefined): string {
    switch (estado) {
      case 1:
        return 'badge text-bg-success';
      case 0:
        return 'badge text-bg-secondary';
      default:
        return 'badge text-bg-light text-dark';
    }
  }

  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
  }

  load(): void {
    this.loading = true;
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

    const v = this.form.value;

    this.service
      .listDocumentos({
        page: this.page,
        pageSize: this.pageSize,

        id: v.id ? Number(v.id) : undefined,
        q: v.q || undefined,

        entidadTipo: v.entidadTipo ? (v.entidadTipo as any) : undefined,
        entidadId: v.entidadId ? Number(v.entidadId) : undefined,

        ciudadanoDni: v.ciudadanoDni || undefined,
        categoria: v.categoria || undefined,
        extension: v.extension || undefined,

        fechaDesde: v.fechaDesde || undefined,
        fechaHasta: v.fechaHasta || undefined,

        estado: v.estado ?? undefined,
      })
      .subscribe({
        next: (res) => {
          if (myReq !== this.reqSeq) return;

          const incoming = res.items ?? [];
          const total = res.total ?? incoming.length;

          const from =
            incoming.length > 0
              ? (this.page - 1) * this.pageSize + 1
              : 0;

          const to = (this.page - 1) * this.pageSize + incoming.length;
          const last = this.pageSize
            ? Math.max(1, Math.ceil(total / this.pageSize))
            : 1;

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
        },
      });
  }

  private finishLoadingWithOverlayMin(): void {
    const complete = () => {
      this.loading = false;
      clearTimeout(this.overlayTimer);

      if (this.showOverlay) {
        const elapsed = performance.now() - this.overlayShownAt;
        const remain = Math.max(0, this.minOverlayMs - elapsed);

        setTimeout(() => {
          this.showOverlay = false;
        }, remain);
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
  async reactivarDocumento(item: VMDocumentoListaSimple): Promise<void> {
    const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Restaurar documento',
        message: `¿Deseas restaurar el documento "${item.nombreOriginal}"?`,
        confirmText: 'Restaurar',
        cancelText: 'Cancelar',
    });

    if (!ok) return;

    try {
        await this.service.reactivarDocumento(item.id);

        await this.notify.ok({
        variant: 'success',
        title: 'Documento restaurado',
        message: 'El documento fue restaurado correctamente.',
        primaryText: 'Aceptar',
        });

        this.load();
    } catch {
        // El interceptor ya mostró el error.
    }
  }
  trackById(_index: number, item: VMDocumentoListaSimple) {
    return item.id;
  }
}