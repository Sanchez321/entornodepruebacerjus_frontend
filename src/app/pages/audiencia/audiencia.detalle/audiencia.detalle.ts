// src/app/pages/audiencia/audiencia.detalle/audiencia.detalle.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,FormControl,Validators,AbstractControl,ValidationErrors,ValidatorFn,} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Subscription } from 'rxjs';

import { AudienciaService } from '../services/audiencia.service';
import {VMAudienciaDetalleSimple,VMAudienciaUpdate,VMAudienciaAsesorResumen,} from '../models/audiencia.vm';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

const noBlank: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '').trim();
    return v.length === 0 ? { required: true } : null;
};

type EstadoAudienciaManual = '' | 'CANCELADA';

@Component({
    selector: 'app-audiencia-detalle',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './audiencia.detalle.html',
    styleUrl: './audiencia.detalle.css',
})
export class AudienciaDetalle implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private service = inject(AudienciaService);
    private notify = inject(NotificacionesService);
    private pageMeta = inject(PageMetaService);

    private subForm = new Subscription();

    idaudiencia = 0;
    data: VMAudienciaDetalleSimple | null = null;

    open = true;
    isEditing = false;
    submittedEdit = false;
    submitting = false;

    asesorEncontrado: VMAudienciaAsesorResumen | null = null;
    asesorBuscado = false;
    buscandoAsesor = false;

    private asesorReqSeq = 0;

    originalFormData!: AudienciaDetalleForm;

    creadoPorNombre: string | null = null;
    creadoPorDni: string | null = null;
    fechaCreadoPor: Date | string | null = null;

    modificadoPorNombre: string | null = null;
    modificadoPorDni: string | null = null;
    fechaModificadoPor: Date | string | null = null;

    estadoPorNombre: string | null = null;
    estadoPorDni: string | null = null;
    fechaEstadoPor: Date | string | null = null;

    form = this.fb.group<ControlsOf<AudienciaDetalleForm>>({
        idproceso: new FormControl(0, { nonNullable: true }),
        idconsulta: new FormControl(0, { nonNullable: true }),
        dni: new FormControl('', { nonNullable: true }),

        numeroExpediente: new FormControl('', { nonNullable: true }),
        demandante: new FormControl('', { nonNullable: true }),

        asesorId: new FormControl(0, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(1)],
        }),

        asesorNombre: new FormControl('', { nonNullable: true }),

        asesorDniBusqueda: new FormControl('', {
            nonNullable: true,
            validators: [Validators.pattern(/^\d{0,11}$/)],
        }),

        titulo: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(150)],
        }),

        abogado: new FormControl('', {
            nonNullable: true,
            validators: [noBlank, Validators.maxLength(150)],
        }),

        fechaHoraInicio: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),

        fechaHoraFin: new FormControl('', {
            nonNullable: true,
        }),

        enlaceMeet: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(500)],
        }),

        estadoAudiencia: new FormControl<EstadoAudienciaManual>('', {
            nonNullable: true,
        }),

        observacion: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(600)],
        }),
    });

    ngOnInit(): void {
        this.form.disable();

        const id = Number(
            this.route.snapshot.paramMap.get('idaudiencia') ??
            this.route.snapshot.paramMap.get('id')
        );

        if (!id || isNaN(id)) return;

        this.idaudiencia = id;

        this.pageMeta.replace({
            titulo: 'Audiencia:',
            ruta: ['/audiencia'],
        });

        this.subForm.add(
            this.form.get('asesorDniBusqueda')!.valueChanges
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                )
                .subscribe(() => {
                    if (this.isEditing) {
                        this.buscarAsesor();
                    }
                }),
        );

        this.load();
    }

    ngOnDestroy(): void {
        this.subForm.unsubscribe();
        this.asesorReqSeq++;
        this.pageMeta.clear();
    }

    private load(): void {
        this.service.getById(this.idaudiencia).subscribe({
            next: (data) => {
                this.aplicarDetalle(data);

                this.service.getControlById(this.idaudiencia).subscribe({
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

    private aplicarDetalle(data: VMAudienciaDetalleSimple): void {
        const formData: AudienciaDetalleForm = {
            idproceso: data.idproceso,
            idconsulta: data.idconsulta,
            dni: data.dni ?? '—',

            numeroExpediente: data.numeroExpediente ?? '',
            demandante: data.demandante ?? '',

            asesorId: data.asesorId ?? 0,
            asesorNombre: data.asesorNombre ?? '—',
            asesorDniBusqueda: '',

            titulo: data.titulo ?? '',
            abogado: data.abogado ?? '',

            fechaHoraInicio: this.toDateTimeLocalInput(data.fechaHoraInicio),
            fechaHoraFin: this.toDateTimeLocalInput(data.fechaHoraFin),

            enlaceMeet: data.enlaceMeet ?? '',

            estadoAudiencia: this.isCancelada(data.estadoAudiencia) ? 'CANCELADA' : '',

            observacion: data.observacion ?? '',
        };

        this.data = data;
        this.originalFormData = { ...formData };

        this.asesorEncontrado = null;
        this.asesorBuscado = false;
        this.buscandoAsesor = false;

        this.form.reset(formData);
        this.form.disable();

        this.isEditing = false;
        this.submittedEdit = false;

        this.form.markAsPristine();
        this.form.markAsUntouched();

        this.pageMeta.set({
            titulo: `Audiencia Nº${data.id} - Expediente: ${data.numeroExpediente || '-'}`,
        });
    }

    private aplicarControl(control: AudienciaControlData): void {
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

        this.asesorEncontrado = null;
        this.asesorBuscado = false;
        this.buscandoAsesor = false;

        this.form.enable();

        this.form.controls.idproceso.disable({ emitEvent: false });
        this.form.controls.idconsulta.disable({ emitEvent: false });
        this.form.controls.dni.disable({ emitEvent: false });
        this.form.controls.numeroExpediente.disable({ emitEvent: false });
        this.form.controls.demandante.disable({ emitEvent: false });
        this.form.controls.asesorNombre.disable({ emitEvent: false });

        this.form.updateValueAndValidity({ emitEvent: false });
        this.form.markAsPristine();
        this.form.markAsUntouched();
    }

    buscarAsesor(): void {
        const dni = this.form.get('asesorDniBusqueda')!.value.trim();

        if (!dni) {
            this.asesorEncontrado = null;
            this.asesorBuscado = false;
            this.buscandoAsesor = false;

            this.form.patchValue({
                asesorId: this.originalFormData?.asesorId ?? 0,
                asesorNombre: this.originalFormData?.asesorNombre ?? '—',
            }, { emitEvent: false });

            return;
        }

        if (dni.length < 8) {
            this.asesorEncontrado = null;
            this.asesorBuscado = false;
            this.buscandoAsesor = false;
            return;
        }

        this.buscandoAsesor = true;
        this.asesorEncontrado = null;

        const myReq = ++this.asesorReqSeq;

        this.service.getAsesorResumenByDni(dni).subscribe({
            next: (asesor) => {
                if (myReq !== this.asesorReqSeq) return;

                this.asesorEncontrado = asesor;
                this.asesorBuscado = true;
                this.buscandoAsesor = false;

                if (asesor) {
                    this.form.patchValue({
                        asesorId: asesor.id,
                        asesorNombre: asesor.nombreCompleto,
                    }, { emitEvent: false });
                }
            },
            error: () => {
                if (myReq !== this.asesorReqSeq) return;

                this.asesorEncontrado = null;
                this.asesorBuscado = true;
                this.buscandoAsesor = false;
            },
        });
    }

    limpiarAsesor(): void {
        this.asesorEncontrado = null;
        this.asesorBuscado = false;
        this.buscandoAsesor = false;
        this.asesorReqSeq++;

        this.form.patchValue({
            asesorDniBusqueda: '',
            asesorId: this.originalFormData?.asesorId ?? 0,
            asesorNombre: this.originalFormData?.asesorNombre ?? '—',
        }, { emitEvent: false });
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

        this.asesorEncontrado = null;
        this.asesorBuscado = false;
        this.buscandoAsesor = false;
        this.asesorReqSeq++;

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

        const msgAsesor = this.validaAsesor();

        if (msgAsesor) {
            await this.notify.ok({
                variant: 'warning',
                title: 'Asesor inválido',
                message: msgAsesor,
                primaryText: 'Aceptar',
            });

            return;
        }

        const msgFechas = this.validaFechas();

        if (msgFechas) {
            await this.notify.ok({
                variant: 'warning',
                title: 'Horario inválido',
                message: msgFechas,
                primaryText: 'Aceptar',
            });

            return;
        }

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

        const msgCruce = await this.validaCruceHorarioFrontend();

        if (msgCruce) {
            await this.notify.ok({
                variant: 'warning',
                title: 'Cruce de horario',
                message: msgCruce,
                primaryText: 'Aceptar',
            });

            return;
        }

        const raw = this.form.getRawValue();

        const currentForm: AudienciaDetalleForm = {
            idproceso: raw.idproceso,
            idconsulta: raw.idconsulta,
            dni: raw.dni,

            numeroExpediente: raw.numeroExpediente,
            demandante: raw.demandante,

            asesorId: raw.asesorId,
            asesorNombre: raw.asesorNombre,
            asesorDniBusqueda: raw.asesorDniBusqueda,

            titulo: raw.titulo,
            abogado: raw.abogado,

            fechaHoraInicio: raw.fechaHoraInicio,
            fechaHoraFin: raw.fechaHoraFin,

            enlaceMeet: raw.enlaceMeet,

            estadoAudiencia: raw.estadoAudiencia,

            observacion: raw.observacion,
        };

        const changes: Partial<VMAudienciaUpdate> = {};

        if (currentForm.asesorId !== this.originalFormData.asesorId) {
            changes.asesorId = currentForm.asesorId;
        }

        if (currentForm.titulo !== this.originalFormData.titulo) {
            changes.titulo = currentForm.titulo;
        }

        if (currentForm.abogado !== this.originalFormData.abogado) {
            changes.abogado = currentForm.abogado;
        }

        if (currentForm.fechaHoraInicio !== this.originalFormData.fechaHoraInicio) {
            changes.fechaHoraInicio = currentForm.fechaHoraInicio;
        }

        if (currentForm.fechaHoraFin !== this.originalFormData.fechaHoraFin) {
            changes.fechaHoraFin = currentForm.fechaHoraFin || null;
        }

        if (currentForm.enlaceMeet !== this.originalFormData.enlaceMeet) {
            changes.enlaceMeet = currentForm.enlaceMeet;
        }

        if (currentForm.estadoAudiencia !== this.originalFormData.estadoAudiencia) {
            changes.estadoAudiencia = currentForm.estadoAudiencia || '';
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

        if (!this.idaudiencia || isNaN(this.idaudiencia)) {
            await this.notify.ok({
                variant: 'error',
                title: 'Operación inválida',
                message: 'No se encontró el ID de la audiencia.',
                primaryText: 'Aceptar',
            });

            return;
        }

        this.submitting = true;

        try {
            await this.service.update(this.idaudiencia, changes);

            const detalle = await firstValueFrom(this.service.getById(this.idaudiencia));
            this.aplicarDetalle(detalle);

            this.service.getControlById(this.idaudiencia).subscribe({
                next: (control) => this.aplicarControl(control),
                error: () => {},
            });

            await this.notify.ok({
                variant: 'success',
                title: 'Cambios guardados',
                message: 'La información de la audiencia se actualizó correctamente.',
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

    private validaAsesor(): string | null {
        const v = this.form.getRawValue();
        const dniNuevo = (v.asesorDniBusqueda ?? '').trim();

        if (!v.asesorId || v.asesorId <= 0) {
            return 'Debe existir un asesor válido asignado a la audiencia.';
        }

        if (dniNuevo && !this.asesorEncontrado && v.asesorId === this.originalFormData.asesorId) {
            return 'Si deseas cambiar el asesor, ingresa un DNI válido. Si no deseas cambiarlo, limpia el campo de búsqueda.';
        }

        return null;
    }

    private validaFechas(): string | null {
        const v = this.form.getRawValue();

        if (!v.fechaHoraInicio) {
            return 'Debe indicar la fecha y hora de inicio de la audiencia.';
        }

        const inicio = new Date(v.fechaHoraInicio).getTime();

        if (!Number.isFinite(inicio)) {
            return 'La fecha y hora de inicio no es válida.';
        }

        if (!v.fechaHoraFin) {
            return null;
        }

        const fin = new Date(v.fechaHoraFin).getTime();

        if (!Number.isFinite(fin)) {
            return 'La fecha y hora de fin no es válida.';
        }

        if (fin <= inicio) {
            return 'La fecha y hora de fin debe ser posterior al inicio.';
        }

        const duracionMinutos = Math.round((fin - inicio) / 60000);

        if (duracionMinutos > 360) {
            return 'La audiencia no puede durar más de 6 horas.';
        }

        return null;
    }

    private async validaCruceHorarioFrontend(): Promise<string | null> {
        const v = this.form.getRawValue();

        if (v.estadoAudiencia === 'CANCELADA') {
            return null;
        }

        const asesorId = Number(v.asesorId);
        const inicio = new Date(v.fechaHoraInicio);
        const fin = v.fechaHoraFin
            ? new Date(v.fechaHoraFin)
            : new Date(inicio.getTime() + 45 * 60 * 1000);

        if (!asesorId || isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return null;
        }

        const semana = await firstValueFrom(
            this.service.calendarioSemana({
                fecha: v.fechaHoraInicio,
            }),
        );

        const cruce = (semana.items ?? []).find((a) => {
            if (a.id === this.idaudiencia) return false;
            if (a.asesorId !== asesorId) return false;

            const estado = String(a.estadoAudiencia ?? '').trim().toUpperCase();

            if (estado === 'CANCELADO' || estado === 'CANCELADA') {
                return false;
            }

            const aInicio = new Date(a.fechaHoraInicio);
            const aFin = a.fechaHoraFin
                ? new Date(a.fechaHoraFin)
                : new Date(aInicio.getTime() + 45 * 60 * 1000);

            return aInicio < fin && aFin > inicio;
        });

        if (!cruce) return null;

        return `El asesor ya tiene una audiencia registrada en ese horario. Audiencia Nº ${cruce.id}.`;
    }

    private hasUnsavedChanges(): boolean {
        if (!this.originalFormData) return false;

        const v = this.form.getRawValue() as Record<string, unknown>;
        const o = this.originalFormData as Record<string, unknown>;

        const editableFields: Array<keyof AudienciaDetalleForm> = [
            'asesorId',
            'asesorDniBusqueda',
            'titulo',
            'abogado',
            'fechaHoraInicio',
            'fechaHoraFin',
            'enlaceMeet',
            'estadoAudiencia',
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
            titulo: this.clean(v.titulo),
            abogado: this.clean(v.abogado),
            asesorDniBusqueda: this.clean(v.asesorDniBusqueda),
            enlaceMeet: this.clean(v.enlaceMeet),
            observacion: this.clean(v.observacion),
        }, { emitEvent: false });
    }

    private clean(value: unknown): string {
        return String(value ?? '').trim();
    }

    private isCancelada(value: string | null | undefined): boolean {
        const v = (value ?? '').trim().toUpperCase();
        return v === 'CANCELADO' || v === 'CANCELADA';
    }

    private toDateTimeLocalInput(value: unknown): string {
        if (!value) return '';

        const d = value instanceof Date ? value : new Date(String(value));

        if (isNaN(d.getTime())) return '';

        const pad = (n: number) => String(n).padStart(2, '0');

        return [
            d.getFullYear(),
            pad(d.getMonth() + 1),
            pad(d.getDate()),
        ].join('-') + 'T' + [
            pad(d.getHours()),
            pad(d.getMinutes()),
        ].join(':');
    }
}

type AudienciaDetalleForm = {
    idproceso: number;
    idconsulta: number;
    dni: string;

    numeroExpediente: string;
    demandante: string;

    asesorId: number;
    asesorNombre: string;
    asesorDniBusqueda: string;

    titulo: string;
    abogado: string;

    fechaHoraInicio: string;
    fechaHoraFin: string;

    enlaceMeet: string;

    estadoAudiencia: EstadoAudienciaManual;

    observacion: string;
};

type AudienciaControlData = {
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