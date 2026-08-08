// src/app/pages/documentos/documentos.registrar/documentos.registrar.ts

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,FormControl,Validators,} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DocumentosService } from '../services/documentos.service';

import {VMDocumentoRutaBaseListaSimple,VMDocumentoSubir,} from '../models/documentos.vm';

import {DOCUMENTO_TIPO_OPCIONES,DocumentoEntidadTipo,documentoCategoriaOpcionesPorTipo,documentoEntidadIdLabel,documentoEntidadIdPlaceholder,
  documentoTipoRequiereEntidadId,
} from '../models/documentos.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-documentos-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './documentos.registrar.html',
  styleUrl: './documentos.registrar.css',
})
export class DocumentosRegistrar implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(DocumentosService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  private subForm = new Subscription();

  readonly tipoOpciones = DOCUMENTO_TIPO_OPCIONES;

  rutasBase: VMDocumentoRutaBaseListaSimple[] = [];
  selectedFile: File | null = null;

  submitting = false;

  form = this.fb.group<ControlsOf<DocumentosRegistrarForm>>({
    entidadTipo: new FormControl<DocumentoEntidadTipo | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    entidadId: new FormControl<number | null>(null, {
      validators: [],
    }),

    rutaBaseId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),

    categoria: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    categoriaOtros: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(80)],
    }),

    fechaDocumento: new FormControl('', {
      nonNullable: true,
    }),

    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
  });

  get entidadTipo(): DocumentoEntidadTipo | '' {
    return this.form.controls.entidadTipo.value;
  }

  get categoriaOpciones(): readonly { value: string; label: string }[] {
    return documentoCategoriaOpcionesPorTipo(this.entidadTipo);
  }

  get requiereEntidadId(): boolean {
    return documentoTipoRequiereEntidadId(this.entidadTipo);
  }

  get entidadIdLabel(): string {
    return documentoEntidadIdLabel(this.entidadTipo);
  }

  get entidadIdPlaceholder(): string {
    return documentoEntidadIdPlaceholder(this.entidadTipo);
  }

  get isCategoriaOtros(): boolean {
    return this.form.controls.categoria.value === 'OTROS';
  }

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Registrar documento',
      ruta: ['/documentos'],
    });

    this.cargarRutasBase();

    this.subForm.add(
      this.form.controls.entidadTipo.valueChanges.subscribe(() => {
        this.onTipoDocumentoChange();
      }),
    );

    this.subForm.add(
      this.form.controls.categoria.valueChanges.subscribe(() => {
        this.syncCategoriaOtros();
      }),
    );

    this.syncCategoriaOtros();
    this.syncEntidadId();
  }

  ngOnDestroy(): void {
    this.subForm.unsubscribe();
    this.pageMeta.clear();
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
          this.setRutaBasePorTipo();
        },
        error: () => {
          this.rutasBase = [];
        },
      });
  }

  private onTipoDocumentoChange(): void {
    this.form.patchValue(
      {
        categoria: '',
        categoriaOtros: '',
        entidadId: null,
      },
      { emitEvent: false },
    );

    this.syncEntidadId();
    this.syncCategoriaOtros();
    this.setRutaBasePorTipo();
  }

  private setRutaBasePorTipo(): void {
    if (this.rutasBase.length === 0) return;

    const tipo = this.entidadTipo;

    const rutaPreferida =
      tipo === 'BACKUP'
        ? this.rutasBase.find((r) => r.codigo === 'BACKUP') ?? this.rutasBase[0]
        : this.rutasBase.find((r) => r.codigo === 'GENERAL') ?? this.rutasBase[0];

    if (rutaPreferida) {
      this.form.patchValue(
        { rutaBaseId: rutaPreferida.id },
        { emitEvent: false },
      );
    }
  }

  private syncEntidadId(): void {
    const ctrl = this.form.controls.entidadId;

    if (this.requiereEntidadId) {
      ctrl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      ctrl.clearValidators();
      ctrl.setValue(null, { emitEvent: false });
    }

    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private syncCategoriaOtros(): void {
    const ctrl = this.form.controls.categoriaOtros;

    if (this.isCategoriaOtros) {
      ctrl.enable({ emitEvent: false });
      ctrl.setValidators([Validators.required, Validators.maxLength(80)]);
    } else {
      ctrl.clearValidators();
      ctrl.setValue('', { emitEvent: false });
      ctrl.disable({ emitEvent: false });
    }

    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  async onSubmit(): Promise<void> {
    if (!this.selectedFile) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Archivo requerido',
        message: 'Seleccione un archivo para subir.',
        primaryText: 'Aceptar',
      });
      return;
    }

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Revisa el tipo, ruta base, categoría y datos obligatorios.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const v = this.form.getRawValue();

    const tipo = v.entidadTipo;

    if (!tipo) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Tipo requerido',
        message: 'Seleccione el tipo de documento.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const categoria =
      v.categoria === 'OTROS'
        ? v.categoriaOtros.trim()
        : v.categoria.trim();

    if (!categoria) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Categoría requerida',
        message: 'Seleccione o indique la categoría del documento.',
        primaryText: 'Aceptar',
      });
      return;
    }

    if (documentoTipoRequiereEntidadId(tipo) && !v.entidadId) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Entidad requerida',
        message: `Indique el ${this.entidadIdLabel.toLowerCase()}.`,
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'info',
      title: 'Registrar documento',
      message: '¿Deseas subir y registrar este documento?',
      confirmText: 'Registrar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    const vm: VMDocumentoSubir = {
      file: this.selectedFile,
      entidadTipo: tipo,
      entidadId: documentoTipoRequiereEntidadId(tipo)
        ? Number(v.entidadId)
        : undefined,
      rutaBaseId: Number(v.rutaBaseId),
      categoria,
      descripcion: v.descripcion,
      fechaDocumento: v.fechaDocumento || undefined,
    };

    this.submitting = true;

    try {
      await this.service.subirDocumento(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Documento registrado',
        message: 'El documento fue subido y registrado correctamente.',
        primaryText: 'Aceptar',
      });

      await this.router.navigate(['/documentos']);
    } catch {
      // El interceptor global muestra el error.
    } finally {
      this.submitting = false;
    }
  }

  async onBack(): Promise<void> {
    if (this.form.dirty || this.selectedFile) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar registro',
        message: 'Hay datos sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir aquí',
      });

      if (!ok) return;
    }

    await this.router.navigate(['/documentos']);
  }
}

interface DocumentosRegistrarForm {
  entidadTipo: DocumentoEntidadTipo | '';
  entidadId: number | null;
  rutaBaseId: number | null;
  categoria: string;
  categoriaOtros: string;
  fechaDocumento: string;
  descripcion: string;
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};