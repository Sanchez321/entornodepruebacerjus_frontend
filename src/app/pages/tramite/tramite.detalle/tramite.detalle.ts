// src/app/pages/tramite/tramite.detalle/tramite.detalle.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TramiteService } from '../services/tramite.service';
import { VMTramiteDetalleSimple, VMTramiteUpdate } from '../models/tramite.vm';
import { EstadoTramite, ESTADO_TRAMITE_OPCIONES } from '../models/tramite.dominio';
import { DocumentosListaEntidad } from '../../documentos/documentos.lista.entidad/documentos.lista.entidad';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
    selector: 'app-tramite-detalle',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule,DocumentosListaEntidad],
    templateUrl: './tramite.detalle.html',
    styleUrl: './tramite.detalle.css',
})
export class TramiteDetalle implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private service = inject(TramiteService);
    private notify = inject(NotificacionesService);
    private pageMeta = inject(PageMetaService);

    readonly estadoTramiteOpciones = ESTADO_TRAMITE_OPCIONES;

    idtramite = 0;
    data: VMTramiteDetalleSimple | null = null;

    open = true;
    openDocumentos = true;
    isEditing = false;
    submittedEdit = false;
    submitting = false;

    originalFormData!: TramiteDetalleForm;

    creadoPorNombre: string | null = null;
    creadoPorDni: string | null = null;
    fechaCreadoPor: Date | string | null = null;

    modificadoPorNombre: string | null = null;
    modificadoPorDni: string | null = null;
    fechaModificadoPor: Date | string | null = null;

    estadoPorNombre: string | null = null;
    estadoPorDni: string | null = null;
    fechaEstadoPor: Date | string | null = null;

    form = this.fb.group<ControlsOf<TramiteDetalleForm>>({
        dni: new FormControl('', { nonNullable: true }),

        fechaRegistrada: new FormControl('', { nonNullable: true }),

        expediente: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(50)] }),
        entidad: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }),

        asunto: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
        descripcion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(600)] }),

        estadoTramite: new FormControl('', { nonNullable: true, validators: [Validators.required] }),

        fechaInicio: new FormControl('', { nonNullable: true }),
        fechaVencimiento: new FormControl('', { nonNullable: true }),
        fechaConclusion: new FormControl('', { nonNullable: true }),

        observacion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(600)] }),
    });

    ngOnInit(): void {
        this.form.disable();

        const id = Number(
        this.route.snapshot.paramMap.get('idtramite') ??
        this.route.snapshot.paramMap.get('id')
        );

        if (!id || isNaN(id)) return;

        this.idtramite = id;

        this.pageMeta.replace({
        titulo: 'Trámite:',
        ruta: ['/tramite'],
        });

        this.load();
    }

    ngOnDestroy(): void {
        this.pageMeta.clear();
    }

    private load(): void {
        this.service.getById(this.idtramite).subscribe({
        next: (data) => {
            this.aplicarDetalle(data);

            this.service.getControlById(this.idtramite).subscribe({
            next: (control) => this.aplicarControl(control),
            error: () => {
                // Si no carga auditoría, no bloquea el detalle.
            },
            });
        },
        error: () => {
            // El interceptor ya mostró el diálogo.
        },
        });
    }

    private aplicarDetalle(data: VMTramiteDetalleSimple): void {
        const formData: TramiteDetalleForm = {
            dni: data.dni ?? '—',

            fechaRegistrada: data.fechaRegistrada ?? '',

            expediente: data.expediente ?? '',
            entidad: data.entidad ?? '',
            asunto: data.asunto ?? '',
            descripcion: data.descripcion ?? '',

            estadoTramite: data.estadoTramite ?? '',

            fechaInicio: data.fechaInicio ?? '',
            fechaVencimiento: data.fechaVencimiento ?? '',
            fechaConclusion: data.fechaConclusion ?? '',

            observacion: data.observacion ?? '',
        };

        this.data = data;
        this.originalFormData = { ...formData };

        this.form.reset(formData);
        this.form.disable();

        this.isEditing = false;
        this.submittedEdit = false;

        this.form.markAsPristine();
        this.form.markAsUntouched();

        this.pageMeta.set({
        titulo: `Trámite Nº${data.id} - Consulta Nº${data.idconsulta} - Asunto: ${data.asunto || '-'}`,
        });
    }

    private aplicarControl(control: TramiteControlData): void {
        this.creadoPorNombre = control.creadoPorNombre ?? null;
        this.creadoPorDni = control.creadoPorDni ?? null;
        this.fechaCreadoPor = control.fechaCreadoPor ?? null;

        this.modificadoPorNombre = control.modificadoPorNombre ?? null;
        this.modificadoPorDni = control.modificadoPorDni ?? null;
        this.fechaModificadoPor = control.fechaModificadoPor ?? null;

        this.estadoPorNombre = control.estadoPorNombre ?? null;
        this.estadoPorDni = control.estadoPorDni ?? null;
        this.fechaEstadoPor = control.fechaEstadoPor ?? null;
    }

    onEdit(event: Event): void {
        event.stopPropagation();

        if (this.isEditing) return;

        this.submittedEdit = false;
        this.isEditing = true;
        this.open = true;

        this.form.enable();

        this.form.controls.dni.disable({ emitEvent: false });

        this.form.updateValueAndValidity({ emitEvent: false });
        this.form.markAsPristine();
        this.form.markAsUntouched();
    }


    async onCancel(): Promise<void> {
        if (this.hasUnsavedChanges()) {
        const ok = await this.notify.confirm({
            variant: 'warning',
            title: 'Descartar cambios',
            message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
            confirmText: 'Descartar',
            cancelText: 'Seguir editando',
        });

        if (!ok) return;
        }

        this.form.reset(this.originalFormData);

        this.isEditing = false;
        this.submittedEdit = false;

        this.form.disable();
        this.form.markAsPristine();
        this.form.markAsUntouched();
    }

    async onSave(): Promise<void> {
        if (!this.isEditing) return;

        this.submittedEdit = true;
        this.normalizarFormulario();

        this.form.updateValueAndValidity({ emitEvent: false });

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

        const raw = this.form.getRawValue();

        const currentForm: TramiteDetalleForm = {
        dni: raw.dni,

        fechaRegistrada: raw.fechaRegistrada,

        expediente: raw.expediente,
        entidad: raw.entidad,

        asunto: raw.asunto,
        descripcion: raw.descripcion,

        estadoTramite: raw.estadoTramite,

        fechaInicio: raw.fechaInicio,
        fechaVencimiento: raw.fechaVencimiento,
        fechaConclusion: raw.fechaConclusion,

        observacion: raw.observacion,
        };

        const changes: Partial<VMTramiteUpdate> & {
        fechaRegistrada?: string | null;
        } = {};

        if (currentForm.fechaRegistrada !== this.originalFormData.fechaRegistrada) {
        changes.fechaRegistrada = currentForm.fechaRegistrada || null;
        }

        if (currentForm.expediente !== this.originalFormData.expediente) {
        changes.expediente = currentForm.expediente;
        }

        if (currentForm.entidad !== this.originalFormData.entidad) {
        changes.entidad = currentForm.entidad;
        }

        if (currentForm.asunto !== this.originalFormData.asunto) {
        changes.asunto = currentForm.asunto;
        }

        if (currentForm.descripcion !== this.originalFormData.descripcion) {
        changes.descripcion = currentForm.descripcion;
        }

        if (currentForm.estadoTramite !== this.originalFormData.estadoTramite) {
        changes.estadoTramite = currentForm.estadoTramite as EstadoTramite;
        }

        if (currentForm.fechaInicio !== this.originalFormData.fechaInicio) {
        changes.fechaInicio = currentForm.fechaInicio || null;
        }

        if (currentForm.fechaVencimiento !== this.originalFormData.fechaVencimiento) {
        changes.fechaVencimiento = currentForm.fechaVencimiento || null;
        }

        if (currentForm.fechaConclusion !== this.originalFormData.fechaConclusion) {
        changes.fechaConclusion = currentForm.fechaConclusion || null;
        }

        if (currentForm.observacion !== this.originalFormData.observacion) {
        changes.observacion = currentForm.observacion;
        }

        if (Object.keys(changes).length === 0) {
        await this.notify.ok({
            variant: 'info',
            title: 'Sin cambios',
            message: 'No hay cambios para guardar.',
            primaryText: 'Aceptar',
        });

        return;
        }

        const confirm = await this.notify.confirm({
        variant: 'info',
        title: 'Guardar cambios',
        message: '¿Deseas guardar los cambios realizados?',
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
        });

        if (!confirm) return;

        if (!this.idtramite || isNaN(this.idtramite)) {
        await this.notify.ok({
            variant: 'error',
            title: 'Operación inválida',
            message: 'No se encontró el ID del trámite.',
            primaryText: 'Aceptar',
        });

        return;
        }

        this.submitting = true;

        try {
        await this.service.update(this.idtramite, changes);

        const detalle = await firstValueFrom(this.service.getById(this.idtramite));
        this.aplicarDetalle(detalle);

        this.service.getControlById(this.idtramite).subscribe({
            next: (control) => this.aplicarControl(control),
            error: () => {},
        });

        await this.notify.ok({
            variant: 'success',
            title: 'Cambios guardados',
            message: 'La información del trámite se actualizó correctamente.',
            primaryText: 'Aceptar',
        });

        this.isEditing = false;
        this.submittedEdit = false;
        this.form.disable();
        } catch {
        // El interceptor ya mostró el error.
        } finally {
        this.submitting = false;
        }
    }

    private hasUnsavedChanges(): boolean {
        if (!this.originalFormData) return false;

        const v = this.form.getRawValue() as Record<string, unknown>;
        const o = this.originalFormData as Record<string, unknown>;

        const editableFields: Array<keyof TramiteDetalleForm> = [
        'fechaRegistrada',
        'expediente',
        'entidad',
        'asunto',
        'descripcion',
        'estadoTramite',
        'fechaInicio',
        'fechaVencimiento',
        'fechaConclusion',
        'observacion',
        ];

        for (const k of editableFields) {
        if (v[k] !== o[k]) return true;
        }

        return false;
    }

    private normalizarFormulario(): void {
        const v = this.form.getRawValue();

        this.form.patchValue({
        expediente: this.clean(v.expediente),
        entidad: this.clean(v.entidad),
        asunto: this.clean(v.asunto),
        descripcion: this.clean(v.descripcion),
        observacion: this.clean(v.observacion),
        }, { emitEvent: false });
    }

    private clean(value: unknown): string {
        return String(value ?? '').trim();
    }
}

type TramiteDetalleForm = {
    dni: string;

    fechaRegistrada: string;

    expediente: string;
    entidad: string;
    asunto: string;
    descripcion: string;
    estadoTramite: EstadoTramite | '';

    fechaInicio: string;
    fechaVencimiento: string;
    fechaConclusion: string;

    observacion: string;
};

type TramiteControlData = {
    creadoPorNombre?: string | null;
    creadoPorDni?: string | null;
    fechaCreadoPor?: Date | string | null;

    modificadoPorNombre?: string | null;
    modificadoPorDni?: string | null;
    fechaModificadoPor?: Date | string | null;

    estadoPorNombre?: string | null;
    estadoPorDni?: string | null;
    fechaEstadoPor?: Date | string | null;
};

type ControlsOf<T> = {
    [K in keyof T]: FormControl<T[K]>;
};