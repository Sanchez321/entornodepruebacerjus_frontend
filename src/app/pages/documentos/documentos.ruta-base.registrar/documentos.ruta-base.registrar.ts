// src/app/pages/documentos/documentos.ruta-base.registrar/documentos.ruta-base.registrar.ts

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DocumentosService } from '../services/documentos.service';
import { VMDocumentoRutaBaseCreate } from '../models/documentos.vm';
import {DOCUMENTO_RUTA_BASE_CODIGO_OPCIONES,DocumentoRutaBaseCodigo,} from '../models/documentos.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-documentos-ruta-base-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './documentos.ruta-base.registrar.html',
  styleUrl: './documentos.ruta-base.registrar.css',
})
export class DocumentosRutaBaseRegistrar implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(DocumentosService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  readonly codigoOpciones = DOCUMENTO_RUTA_BASE_CODIGO_OPCIONES;

  submitting = false;

  form = this.fb.group<ControlsOf<DocumentoRutaBaseRegistrarForm>>({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),

    codigo: new FormControl<DocumentoRutaBaseCodigo>('GENERAL', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    driveFolderUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),

    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
  });

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Registrar Ruta Base de Drive',
      ruta: ['/documentos/rutas-base'],
    });
  }

  ngOnDestroy(): void {
    this.pageMeta.clear();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Revisa los campos obligatorios e inténtalo nuevamente.',
        primaryText: 'Aceptar',
      });

      return;
    }

    const ok = await this.notify.confirm({
      variant: 'info',
      title: 'Registrar ruta base',
      message: '¿Deseas registrar esta ruta base de Google Drive?',
      confirmText: 'Registrar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.submitting = true;

    try {
      const v = this.form.getRawValue();

      const vm: VMDocumentoRutaBaseCreate = {
        nombre: v.nombre,
        codigo: v.codigo,
        driveFolderUrl: v.driveFolderUrl,
        descripcion: v.descripcion,
      };

      await this.service.createRutaBase(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Ruta base registrada',
        message: 'La ruta base se registró correctamente.',
        primaryText: 'Aceptar',
      });

      this.router.navigate(['/documentos/rutas-base']);
    } catch {
      // El interceptor ya debería mostrar el error.
    } finally {
      this.submitting = false;
    }
  }

  async onBack(): Promise<void> {
    if (this.form.dirty) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Hay datos sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir aquí',
      });

      if (!ok) return;
    }

    this.router.navigate(['/documentos/rutas-base']);
  }
}

interface DocumentoRutaBaseRegistrarForm {
  nombre: string;
  codigo: DocumentoRutaBaseCodigo;
  driveFolderUrl: string;
  descripcion: string;
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};