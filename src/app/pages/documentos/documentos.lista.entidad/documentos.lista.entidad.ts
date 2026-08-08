// src/app/pages/documentos/documentos.lista.proceso/documentos.lista.proceso.ts

import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { DocumentosService } from '../services/documentos.service';
import {VMDocumentoListaSimple,VMDocumentoProcesoSubirForm,VMDocumentoRutaBaseListaSimple,VMDocumentoSubir,
    } from '../models/documentos.vm';

import {DOCUMENTO_CATEGORIA_PROCESO_OPCIONES,DocumentoCategoriaProceso,} from '../models/documentos.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

type DocumentoEntidadAsociadaTipo = 'PROCESO' | 'TRAMITE';

@Component({
  selector: 'app-documentos-lista-entidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './documentos.lista.entidad.html',
  styleUrl: './documentos.lista.entidad.css',
})
export class DocumentosListaEntidad implements OnInit, OnDestroy {
  @Input({ required: true }) entidadTipo!: DocumentoEntidadAsociadaTipo;

  @Input() titulo = 'Documentos asociados.';

  @Input() set entidadId(value: number | undefined) {
    this._entidadId = value;

    if (value != null && value > 0) {
      this.load();
    }
  }

  get entidadId(): number | undefined {
    return this._entidadId;
  }

  private _entidadId?: number;

  private fb = inject(FormBuilder);
  private service = inject(DocumentosService);
  private notify = inject(NotificacionesService);

  private subForm = new Subscription();
  private subUploadForm = new Subscription();

  readonly categoriaOpciones = DOCUMENTO_CATEGORIA_PROCESO_OPCIONES;

  rutasBase: VMDocumentoRutaBaseListaSimple[] = [];
  selectedFile: File | null = null;

  showUploadModal = false;
  uploading = false;

  form = this.fb.group({
    q: [''],
    categoria: [''],
    extension: [''],
  });

  uploadForm = this.fb.group<ControlsOf<DocumentoEntidadSubirForm>>({
    rutaBaseId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),

    categoria: new FormControl<DocumentoCategoriaProceso>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    categoriaOtros: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(80)],
    }),

    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),

    fechaDocumento: new FormControl('', {
      nonNullable: true,
    }),
  });

  items: VMDocumentoListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 6;

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

  get isCategoriaOtros(): boolean {
    return this.uploadForm.controls.categoria.value === 'OTROS';
  }

  get modalTitulo(): string {
    return this.entidadTipo === 'TRAMITE'
      ? 'Añadir documento al trámite'
      : 'Añadir documento al proceso';
  }

  ngOnInit(): void {
    this.cargarRutasBase();

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

    this.subUploadForm.add(
      this.uploadForm.controls.categoria.valueChanges.subscribe(() => {
        this.syncCategoriaOtros();
      }),
    );

    this.syncCategoriaOtros();
  }

  ngOnDestroy(): void {
    this.subForm.unsubscribe();
    this.subUploadForm.unsubscribe();
    this.cancelTimers();
  }

  private cargarRutasBase(): void {
    this.service
      .listRutasBase({
        page: 1,
        pageSize: 50,
        estado: 1,
      })
      .subscribe({
        next: (res) => {
          this.rutasBase = res.items ?? [];

          const general =
            this.rutasBase.find((r) => r.codigo === 'GENERAL') ??
            this.rutasBase[0];

          if (general && this.uploadForm.controls.rutaBaseId.value == null) {
            this.uploadForm.patchValue(
              { rutaBaseId: general.id },
              { emitEvent: false },
            );
          }
        },
        error: () => {
          this.rutasBase = [];
        },
      });
  }

  clear(): void {
    this.form.reset({
      q: '',
      categoria: '',
      extension: '',
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

  abrirModalSubida(): void {
    this.selectedFile = null;

    this.uploadForm.reset({
      rutaBaseId: this.uploadForm.controls.rutaBaseId.value,
      categoria: '',
      categoriaOtros: '',
      descripcion: '',
      fechaDocumento: '',
    });

    this.syncCategoriaOtros();
    this.showUploadModal = true;
  }

  cerrarModalSubida(): void {
    if (this.uploading) return;
    this.showUploadModal = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  async subirDocumento(): Promise<void> {
    if (!this._entidadId) return;

    if (!this.selectedFile) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Archivo requerido',
        message: 'Seleccione un archivo para subir.',
        primaryText: 'Aceptar',
      });
      return;
    }

    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();

      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Seleccione la ruta base y la categoría del documento.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const v = this.uploadForm.getRawValue();

    const categoria =
      v.categoria === 'OTROS'
        ? v.categoriaOtros.trim()
        : v.categoria;

    if (!categoria) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Falta categoría',
        message: 'Indique la categoría del documento.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'info',
      title: 'Subir documento',
      message: '¿Deseas subir este documento al Drive configurado?',
      confirmText: 'Subir',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    const vm: VMDocumentoSubir = {
      file: this.selectedFile,
      entidadTipo: this.entidadTipo,
      entidadId: this._entidadId,
      rutaBaseId: Number(v.rutaBaseId),
      categoria,
      descripcion: v.descripcion,
      fechaDocumento: v.fechaDocumento || undefined,
    };

    this.uploading = true;

    try {
      await this.service.subirDocumento(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Documento subido',
        message: 'El documento se guardó correctamente.',
        primaryText: 'Aceptar',
      });

      this.showUploadModal = false;
      this.page = 1;
      this.load();
    } catch {
      // El interceptor ya mostró el error.
    } finally {
      this.uploading = false;
    }
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

  private syncCategoriaOtros(): void {
    const otrosCtrl = this.uploadForm.controls.categoriaOtros;

    if (this.isCategoriaOtros) {
      otrosCtrl.enable({ emitEvent: false });
      otrosCtrl.setValidators([Validators.required, Validators.maxLength(80)]);
    } else {
      otrosCtrl.clearValidators();
      otrosCtrl.setValue('', { emitEvent: false });
      otrosCtrl.disable({ emitEvent: false });
    }

    otrosCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
  }

  load(): void {
    if (this._entidadId == null || this._entidadId <= 0) return;
    if (!this.entidadTipo) return;

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
      .listDocumentosPorEntidad(this.entidadTipo, this._entidadId, {
        page: this.page,
        pageSize: this.pageSize,
        q: v.q || undefined,
        categoria: v.categoria || undefined,
        extension: v.extension || undefined,
        estado: 1,
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

  trackById(_index: number, item: VMDocumentoListaSimple) {
    return item.id;
  }
}

interface DocumentoEntidadSubirForm {
  rutaBaseId: number | null;
  categoria: DocumentoCategoriaProceso;
  categoriaOtros: string;
  descripcion: string;
  fechaDocumento: string;
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};