// src/app/pages/audiencia/audiencia.registrar/audiencia.registrar.ts

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,Validators,FormControl,AbstractControl,ValidationErrors,ValidatorFn,} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Subscription } from 'rxjs';

import { AudienciaService } from '../services/audiencia.service';
import { ProcesoService } from '../../proceso/services/proceso.service';

import { VMAudienciaCreate,VMAudienciaAsesorResumen, } from '../models/audiencia.vm';
import { VMProcesoListaSimple } from '../../proceso/models/proceso.vm';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

const noBlank: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '').trim();
    return v.length === 0 ? { required: true } : null;
};

@Component({
    selector: 'app-audiencia-registrar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './audiencia.registrar.html',
    styleUrl: './audiencia.registrar.css',
})
export class AudienciaRegistrar implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private audienciaService = inject(AudienciaService);
    private procesoService = inject(ProcesoService);
    private notify = inject(NotificacionesService);
    private pageMeta = inject(PageMetaService);

    private subForm = new Subscription();

    requiereProceso = true;

    procesos: VMProcesoListaSimple[] = [];
    procesoSeleccionado: VMProcesoListaSimple | null = null;

    procesoTotal = 0;
    procesoPage = 1;
    procesoPageSize = 5;

    buscandoProcesos = false;
    procesoBuscado = false;
    showProcesoOverlay = false;

    procesoShownFrom = 0;
    procesoShownTo = 0;
    procesoShownPage = 1;
    procesoShownLastPage = 1;
    procesoShownTotal = 0;

    private pendProcesos: VMProcesoListaSimple[] = [];
    private pendProcesoTotal = 0;
    private pendProcesoFrom = 0;
    private pendProcesoTo = 0;
    private pendProcesoPage = 1;
    private pendProcesoLastPage = 1;

    private procesoReqSeq = 0;
    private procesoOverlayTimer: any;
    private procesoOverlayShownAt = 0;

    private readonly procesoOverlayDelay = 180;
    private readonly procesoMinOverlayMs = 220;

    submitting = false;

    asesorEncontrado: VMAudienciaAsesorResumen | null = null;
    asesorBuscado = false;
    buscandoAsesor = false;

    private asesorReqSeq = 0;
    headerBlockPx = 40;

    get procesoListMinHeight(): number {
        return this.headerBlockPx + this.procesoPageSize * 48 + 12;
    }

    get procesoSkeletonRows(): number[] {
        return Array.from({ length: this.procesoPageSize }, (_, i) => i);
    }

    get procesoLastPage(): number {
        return this.procesoPageSize
            ? Math.max(1, Math.ceil(this.procesoTotal / this.procesoPageSize))
            : 1;
    }

    form = this.fb.group<ControlsOf<AudienciaRegistrarForm>>({
        idproceso: new FormControl(0, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(1)],
        }),

        dniBusqueda: new FormControl('', {
            nonNullable: true,
            validators: [Validators.pattern(/^\d{0,11}$/)],
        }),

        expedienteBusqueda: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(50)],
        }),

        titulo: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(150)],
        }),

        abogado: new FormControl('', {
            nonNullable: true,
            validators: [noBlank, Validators.maxLength(150)],
        }),

        asesorDniBusqueda: new FormControl('', {
            nonNullable: true,
            validators: [Validators.pattern(/^\d{0,11}$/)],
        }),

        asesorId: new FormControl(0, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(1)],
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

        observacion: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(600)],
        }),
    });

    ngOnInit(): void {
        const idproceso = this.idProcesoFromRoute();

        this.requiereProceso = !(idproceso > 0);

        this.pageMeta.replace({
            titulo: 'Registrar Audiencia',
            ruta: this.backRoute(),
        });

        if (idproceso > 0) {
            this.form.patchValue({ idproceso });
            this.cargarProceso(idproceso);
        }

        this.subForm.add(
            this.form.get('dniBusqueda')!.valueChanges
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                )
                .subscribe(() => {
                    if (this.requiereProceso) {
                        this.procesoPage = 1;
                        this.buscarProcesos();
                    }
                }),
        );

        this.subForm.add(
            this.form.get('expedienteBusqueda')!.valueChanges
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                )
                .subscribe(() => {
                    if (this.requiereProceso) {
                        this.procesoPage = 1;
                        this.buscarProcesos();
                    }
                }),
        );
        this.subForm.add(
            this.form.get('asesorDniBusqueda')!.valueChanges
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                )
                .subscribe(() => {
                    this.buscarAsesor();
                }),
        );
    }

    ngOnDestroy(): void {
        this.subForm.unsubscribe();
        this.cancelProcesoTimers();
        this.asesorReqSeq++;
        this.pageMeta.clear();
    }
    buscarProcesos(): void {
        const dni = this.form.get('dniBusqueda')!.value.trim();
        const expediente = this.form.get('expedienteBusqueda')!.value.trim();

        this.cancelProcesoTimers();

        if (dni.length < 8 && expediente.length < 3) {
            this.procesos = [];
            this.procesoTotal = 0;

            this.procesoShownFrom = 0;
            this.procesoShownTo = 0;
            this.procesoShownPage = 1;
            this.procesoShownLastPage = 1;
            this.procesoShownTotal = 0;

            this.procesoBuscado = false;
            this.buscandoProcesos = false;
            this.showProcesoOverlay = false;
            return;
        }

        this.buscandoProcesos = true;

        const myReq = ++this.procesoReqSeq;

        if (this.procesos.length > 0) {
            this.procesoOverlayTimer = setTimeout(() => {
                if (this.procesoReqSeq === myReq) {
                    this.showProcesoOverlay = true;
                    this.procesoOverlayShownAt = performance.now();
                }
            }, this.procesoOverlayDelay);
        } else {
            this.showProcesoOverlay = false;
        }

        this.procesoService.list({
            page: this.procesoPage,
            pageSize: this.procesoPageSize,
            dni: dni || undefined,
            numeroExpediente: expediente || undefined,
        })
        .subscribe({
            next: (res) => {
                if (myReq !== this.procesoReqSeq) return;

                const incoming = res.items ?? [];
                const total = res.total ?? incoming.length;

                const from = incoming.length > 0
                    ? (this.procesoPage - 1) * this.procesoPageSize + 1
                    : 0;

                const to = incoming.length > 0
                    ? (this.procesoPage - 1) * this.procesoPageSize + incoming.length
                    : 0;

                const last = this.procesoPageSize
                    ? Math.max(1, Math.ceil(total / this.procesoPageSize))
                    : 1;

                this.pendProcesos = incoming;
                this.pendProcesoTotal = total;
                this.pendProcesoFrom = from;
                this.pendProcesoTo = to;
                this.pendProcesoPage = this.procesoPage;
                this.pendProcesoLastPage = last;

                this.finishProcesoLoading();
            },
            error: () => {
                if (myReq !== this.procesoReqSeq) return;

                this.pendProcesos = this.procesos;
                this.pendProcesoTotal = this.procesoTotal;
                this.pendProcesoFrom = this.procesoShownFrom;
                this.pendProcesoTo = this.procesoShownTo;
                this.pendProcesoPage = this.procesoShownPage || this.procesoPage;
                this.pendProcesoLastPage = this.procesoShownLastPage || this.procesoLastPage;

                this.finishProcesoLoading();
            },
        });
    }

    goToProcesoPage(page: number): void {
        if (page < 1) return;

        const last = this.procesoLastPage;
        if (last && page > last) return;

        this.procesoPage = page;
        this.buscarProcesos();
    }

    toggleProceso(p: VMProcesoListaSimple): void {
        if (this.isProcesoSeleccionado(p)) {
            this.limpiarProcesoSeleccionado();
            return;
        }

        this.seleccionarProceso(p);
    }

    seleccionarProceso(p: VMProcesoListaSimple): void {
        this.procesoSeleccionado = p;

        this.form.patchValue({
            idproceso: p.id,
        });
    }

    isProcesoSeleccionado(p: VMProcesoListaSimple): boolean {
        return this.form.get('idproceso')!.value === p.id;
    }

    limpiarProceso(): void {
        this.form.patchValue({
            idproceso: 0,
            dniBusqueda: '',
            expedienteBusqueda: '',
        }, { emitEvent: false });

        this.procesoPage = 1;
        this.procesoTotal = 0;
        this.procesos = [];
        this.procesoBuscado = false;
        this.procesoSeleccionado = null;
        this.buscandoProcesos = false;
        this.showProcesoOverlay = false;

        this.procesoShownFrom = 0;
        this.procesoShownTo = 0;
        this.procesoShownPage = 1;
        this.procesoShownLastPage = 1;
        this.procesoShownTotal = 0;

        this.cancelProcesoTimers();
    }

    limpiarProcesoSeleccionado(): void {
        this.form.patchValue({
            idproceso: 0,
        });

        this.procesoSeleccionado = null;
    }

    buscarAsesor(): void {
        const dni = this.form.get('asesorDniBusqueda')!.value.trim();

        if (dni.length < 8) {
            this.asesorEncontrado = null;
            this.asesorBuscado = false;
            this.buscandoAsesor = false;

            this.form.patchValue({
                asesorId: 0,
            }, { emitEvent: false });

            return;
        }

        this.buscandoAsesor = true;
        this.asesorEncontrado = null;

        this.form.patchValue({
            asesorId: 0,
        }, { emitEvent: false });

        const myReq = ++this.asesorReqSeq;

        this.audienciaService.getAsesorResumenByDni(dni).subscribe({
            next: (asesor) => {
                if (myReq !== this.asesorReqSeq) return;

                this.asesorEncontrado = asesor;
                this.asesorBuscado = true;
                this.buscandoAsesor = false;

                this.form.patchValue({
                    asesorId: asesor?.id ?? 0,
                }, { emitEvent: false });
            },
            error: () => {
                if (myReq !== this.asesorReqSeq) return;

                this.asesorEncontrado = null;
                this.asesorBuscado = true;
                this.buscandoAsesor = false;

                this.form.patchValue({
                    asesorId: 0,
                }, { emitEvent: false });
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
            asesorId: 0,
        }, { emitEvent: false });
    }
    private validaAsesor(): string | null {
        const asesorId = this.form.get('asesorId')!.value;

        if (!asesorId || asesorId <= 0) {
            return 'Debe buscar y seleccionar un asesor válido por DNI.';
        }

        return null;
    }
    async onSubmit(): Promise<void> {
        const msgProceso = this.validaProceso();
        
        if (msgProceso) {
            await this.notify.ok({
                variant: 'warning',
                title: 'Proceso requerido',
                message: msgProceso,
                primaryText: 'Aceptar',
            });
            return;
        }

        const msgAsesor = this.validaAsesor();

        if (msgAsesor) {
            await this.notify.ok({
                variant: 'warning',
                title: 'Asesor requerido',
                message: msgAsesor,
                primaryText: 'Aceptar',
            });
            return;
        }

        this.trimEditableControls();
        this.form.updateValueAndValidity({ emitEvent: false });

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
                message: 'Revisa los campos obligatorios. El proceso, asesor, abogado e inicio son obligatorios.',
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

        this.submitting = true;

        try {
            const v = this.form.getRawValue();

            const vm: VMAudienciaCreate = {
                idproceso: v.idproceso,
                titulo: v.titulo,
                abogado: v.abogado,
                asesorId: Number(v.asesorId),
                fechaHoraInicio: v.fechaHoraInicio,
                fechaHoraFin: v.fechaHoraFin || null,
                enlaceMeet: v.enlaceMeet,
                observacion: v.observacion,
            };

            await this.audienciaService.create(vm);

            await this.notify.ok({
                variant: 'success',
                title: 'Audiencia registrada',
                message: 'La audiencia se creó correctamente.',
                primaryText: 'Aceptar',
            });

            this.router.navigate(this.backRoute());
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : 'No se pudo registrar la audiencia.';

            await this.notify.ok({
                variant: 'warning',
                title: 'Datos inválidos',
                message,
                primaryText: 'Aceptar',
            });
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

        this.router.navigate(this.backRoute());
    }

    private async validaCruceHorarioFrontend(): Promise<string | null> {
        const v = this.form.getRawValue();

        const asesorId = Number(v.asesorId);
        const inicio = new Date(v.fechaHoraInicio);
        const fin = v.fechaHoraFin
            ? new Date(v.fechaHoraFin)
            : new Date(inicio.getTime() + 45 * 60 * 1000);

        if (!asesorId || isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return null;
        }

        const semana = await firstValueFrom(
            this.audienciaService.calendarioSemana({
                fecha: v.fechaHoraInicio,
            }),
        );

        const cruce = (semana.items ?? []).find((a) => {
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

    private validaProceso(): string | null {
        const idproceso = this.form.get('idproceso')!.value;

        if (!idproceso || idproceso <= 0) {
            return 'Debe seleccionar un proceso para registrar la audiencia.';
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

    private cargarProceso(idproceso: number): void {
        this.procesoService.getById(idproceso).subscribe({
            next: (data) => {
                this.procesoSeleccionado = data;

                this.form.patchValue({
                    idproceso: data.id,
                });
            },
            error: () => {
                this.procesoSeleccionado = null;
            },
        });
    }

    private finishProcesoLoading(): void {
        const complete = () => {
            this.buscandoProcesos = false;
            clearTimeout(this.procesoOverlayTimer);

            if (this.showProcesoOverlay) {
                const elapsed = performance.now() - this.procesoOverlayShownAt;
                const remain = Math.max(0, this.procesoMinOverlayMs - elapsed);

                setTimeout(() => {
                    this.showProcesoOverlay = false;
                }, remain);
            } else {
                this.showProcesoOverlay = false;
            }

            this.procesos = this.pendProcesos;
            this.procesoTotal = this.pendProcesoTotal;
            this.procesoShownFrom = this.pendProcesoFrom;
            this.procesoShownTo = this.pendProcesoTo;
            this.procesoShownPage = this.pendProcesoPage;
            this.procesoShownLastPage = this.pendProcesoLastPage;
            this.procesoShownTotal = this.pendProcesoTotal;
            this.procesoBuscado = true;
        };

        complete();
    }

    private cancelProcesoTimers(): void {
        clearTimeout(this.procesoOverlayTimer);
    }

    private trimEditableControls(): void {
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

    private idProcesoFromRoute(): number {
        return Number(
            this.route.snapshot.paramMap.get('idproceso') ??
            this.route.snapshot.paramMap.get('id') ??
            this.route.snapshot.queryParamMap.get('idproceso') ??
            0,
        );
    }

    private backRoute(): any[] {
        const idproceso = this.idProcesoFromRoute();

        if (idproceso > 0) {
            return ['/proceso', idproceso];
        }

        return ['/audiencia'];
    }
}

interface AudienciaRegistrarForm {
    idproceso: number;

    dniBusqueda: string;
    expedienteBusqueda: string;

    titulo: string;
    abogado: string;

    asesorDniBusqueda: string;
    asesorId: number;

    fechaHoraInicio: string;
    fechaHoraFin: string;

    enlaceMeet: string;
    observacion: string;
}

type ControlsOf<T> = {
    [K in keyof T]: FormControl<T[K]>;
};