// src/app/pages/tramite/tramite.registrar/tramite.registrar.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,Validators,FormControl,AbstractControl,ValidationErrors,ValidatorFn,
    } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { TramiteService } from '../services/tramite.service';
import { ConsultaService } from '../../consulta/services/consulta.service';

import { VMTramiteCreate } from '../models/tramite.vm';
import { EstadoTramite, ESTADO_TRAMITE_OPCIONES } from '../models/tramite.dominio';
import {VMConsultaDetalleSimple,VMConsultaListaGeneralSimple,} from '../../consulta/models/consulta.vm';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

const noBlank: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '').trim();
    return v.length === 0 ? { required: true } : null;
};

@Component({
    selector: 'app-tramite-registrar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './tramite.registrar.html',
    styleUrl: './tramite.registrar.css',
})
export class TramiteRegistrar implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private tramiteService = inject(TramiteService);
    private consultaService = inject(ConsultaService);
    private notify = inject(NotificacionesService);
    private pageMeta = inject(PageMetaService);

    private subForm = new Subscription();

    readonly estadoTramiteOpciones = ESTADO_TRAMITE_OPCIONES;

    requiereConsulta = true;

    consultas: VMConsultaListaGeneralSimple[] = [];
    consultaSeleccionada: VMConsultaDetalleSimple | null = null;

    consultaTotal = 0;
    consultaPage = 1;
    consultaPageSize = 5;

    buscandoConsultas = false;
    consultaBuscada = false;
    showConsultaOverlay = false;

    consultaShownFrom = 0;
    consultaShownTo = 0;
    consultaShownPage = 1;
    consultaShownLastPage = 1;
    consultaShownTotal = 0;

    private pendConsultas: VMConsultaListaGeneralSimple[] = [];
    private pendConsultaTotal = 0;
    private pendConsultaFrom = 0;
    private pendConsultaTo = 0;
    private pendConsultaPage = 1;
    private pendConsultaLastPage = 1;

    private consultaReqSeq = 0;
    private consultaOverlayTimer: any;
    private consultaOverlayShownAt = 0;

    private readonly consultaOverlayDelay = 180;
    private readonly consultaMinOverlayMs = 220;

    submitting = false;

    headerBlockPx = 40;

    get consultaListMinHeight(): number {
        return this.headerBlockPx + this.consultaPageSize * 48 + 12;
    }

    get consultaSkeletonRows(): number[] {
        return Array.from({ length: this.consultaPageSize }, (_, i) => i);
    }

    get consultaLastPage(): number {
        return this.consultaPageSize
        ? Math.max(1, Math.ceil(this.consultaTotal / this.consultaPageSize))
        : 1;
    }

    form = this.fb.group<ControlsOf<TramiteRegistrarForm>>({
        idconsulta: new FormControl(0, {nonNullable: true,validators: [Validators.required, Validators.min(1)],}),
        dniBusqueda: new FormControl('', {nonNullable: true,validators: [Validators.pattern(/^\d{0,11}$/)],}),
        expediente: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(50)],}),
        entidad: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(150)],}),
        asunto: new FormControl('', {nonNullable: true,validators: [noBlank, Validators.maxLength(150)],}),
        descripcion: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(600)],}),
        estadoTramite: new FormControl('', {nonNullable: true,validators: [Validators.required],}),
        fechaInicio: new FormControl('', {nonNullable: true,}),
        fechaVencimiento: new FormControl('', {nonNullable: true,}),
        fechaConclusion: new FormControl('', {nonNullable: true,}),
        observacion: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(600)],}),
        usarFechaRegistrada: new FormControl(false, {nonNullable: true,}),
        fechaRegistrada: new FormControl({ value: '', disabled: true }, {nonNullable: true,}),
    });

    ngOnInit(): void {
        const idconsulta = Number(
        this.route.snapshot.paramMap.get('idconsulta') ??
        this.route.snapshot.paramMap.get('id')
        );

        this.requiereConsulta = !(idconsulta > 0);

        this.pageMeta.replace({
        titulo: 'Registrar Trámite',
        ruta: this.backRoute(),
        });

        if (idconsulta > 0) {
        this.form.patchValue({ idconsulta });
        this.cargarConsulta(idconsulta);
        }

        this.subForm.add(
        this.form.get('usarFechaRegistrada')!.valueChanges.subscribe(() => {
            this.syncFechaRegistrada();
        }),
        );

        this.subForm.add(
        this.form.get('dniBusqueda')!.valueChanges
            .pipe(
            debounceTime(300),
            distinctUntilChanged(),
            )
            .subscribe(() => {
            if (this.requiereConsulta) {
                this.consultaPage = 1;
                this.buscarConsultasPorDni();
            }
            }),
        );
        this.syncFechaRegistrada();
    }

    ngOnDestroy(): void {
        this.subForm.unsubscribe();
        this.cancelConsultaTimers();
        this.pageMeta.clear();
    }

    private syncFechaRegistrada(): void {
        const usar = this.form.get('usarFechaRegistrada')!.value;
        const fechaCtrl = this.form.get('fechaRegistrada')!;

        if (usar) {
            fechaCtrl.enable({ emitEvent: false });
            fechaCtrl.setValidators([Validators.required]);
        } else {
            fechaCtrl.setValue('', { emitEvent: false });
            fechaCtrl.clearValidators();
            fechaCtrl.disable({ emitEvent: false });
        }

        fechaCtrl.updateValueAndValidity({ emitEvent: false });
    }

    private cancelConsultaTimers(): void {
        clearTimeout(this.consultaOverlayTimer);
    }

    buscarConsultasPorDni(): void {
        const dni = this.form.get('dniBusqueda')!.value.trim();

        this.cancelConsultaTimers();

        if (dni.length < 8) {
            this.consultas = [];
            this.consultaTotal = 0;

            this.consultaShownFrom = 0;
            this.consultaShownTo = 0;
            this.consultaShownPage = 1;
            this.consultaShownLastPage = 1;
            this.consultaShownTotal = 0;

            this.consultaBuscada = false;
            this.buscandoConsultas = false;
            this.showConsultaOverlay = false;
            return;
        }

        this.buscandoConsultas = true;

        const myReq = ++this.consultaReqSeq;

        if (this.consultas.length > 0) {
        this.consultaOverlayTimer = setTimeout(() => {
            if (this.consultaReqSeq === myReq) {
                this.showConsultaOverlay = true;
                this.consultaOverlayShownAt = performance.now();
            }
        }, this.consultaOverlayDelay);
        } else {
            this.showConsultaOverlay = false;
        }

        this.consultaService.list({
        page: this.consultaPage,
        pageSize: this.consultaPageSize,
        dni,
        })
        .subscribe({
        next: (res) => {
            if (myReq !== this.consultaReqSeq) return;

            const incoming = res.items ?? [];
            const total = res.total ?? incoming.length;

            const from = incoming.length > 0
            ? (this.consultaPage - 1) * this.consultaPageSize + 1
            : 0;

            const to = incoming.length > 0
            ? (this.consultaPage - 1) * this.consultaPageSize + incoming.length
            : 0;

            const last = this.consultaPageSize
            ? Math.max(1, Math.ceil(total / this.consultaPageSize))
            : 1;

            this.pendConsultas = incoming;
            this.pendConsultaTotal = total;
            this.pendConsultaFrom = from;
            this.pendConsultaTo = to;
            this.pendConsultaPage = this.consultaPage;
            this.pendConsultaLastPage = last;

            this.finishConsultaLoading();
        },
        error: () => {
            if (myReq !== this.consultaReqSeq) return;

            this.pendConsultas = this.consultas;
            this.pendConsultaTotal = this.consultaTotal;
            this.pendConsultaFrom = this.consultaShownFrom;
            this.pendConsultaTo = this.consultaShownTo;
            this.pendConsultaPage = this.consultaShownPage || this.consultaPage;
            this.pendConsultaLastPage = this.consultaShownLastPage || this.consultaLastPage;

            this.finishConsultaLoading();
        },
        });
    }

    private finishConsultaLoading(): void {
        const complete = () => {
        this.buscandoConsultas = false;
        clearTimeout(this.consultaOverlayTimer);

        if (this.showConsultaOverlay) {
            const elapsed = performance.now() - this.consultaOverlayShownAt;
            const remain = Math.max(0, this.consultaMinOverlayMs - elapsed);

            setTimeout(() => {
                this.showConsultaOverlay = false;
            }, remain);
        } else {
            this.showConsultaOverlay = false;
        }

        this.consultas = this.pendConsultas;
        this.consultaTotal = this.pendConsultaTotal;
        this.consultaShownFrom = this.pendConsultaFrom;
        this.consultaShownTo = this.pendConsultaTo;
        this.consultaShownPage = this.pendConsultaPage;
        this.consultaShownLastPage = this.pendConsultaLastPage;
        this.consultaShownTotal = this.pendConsultaTotal;
        this.consultaBuscada = true;
        };

        complete();
    }

    goToConsultaPage(page: number): void {
        if (page < 1) return;

        const last = this.consultaLastPage;
        if (last && page > last) return;

        this.consultaPage = page;
        this.buscarConsultasPorDni();
    }

    seleccionarConsulta(c: VMConsultaListaGeneralSimple): void {
        this.form.patchValue({ idconsulta: c.id });
        this.cargarConsulta(c.id);
    }

    toggleConsulta(c: VMConsultaListaGeneralSimple): void {
        if (this.isConsultaSeleccionada(c)) {
            this.limpiarConsultaSeleccionada();
            return;
        }

        this.seleccionarConsulta(c);
    }

    isConsultaSeleccionada(c: VMConsultaListaGeneralSimple): boolean {
        return this.form.get('idconsulta')!.value === c.id;
    }

    limpiarConsultaSeleccionada(): void {
        this.form.patchValue({ idconsulta: 0 });
        this.consultaSeleccionada = null;
    }

    limpiarConsulta(): void {
        this.form.patchValue({idconsulta: 0,dniBusqueda: '',}, { emitEvent: false });
        this.consultaPage = 1;
        this.consultaTotal = 0;
        this.consultas = [];
        this.consultaBuscada = false;
        this.consultaSeleccionada = null;
        this.buscandoConsultas = false;
        this.showConsultaOverlay = false;

        this.consultaShownFrom = 0;
        this.consultaShownTo = 0;
        this.consultaShownPage = 1;
        this.consultaShownLastPage = 1;
        this.consultaShownTotal = 0;

        this.cancelConsultaTimers();
    }

    private cargarConsulta(idconsulta: number): void {
        this.consultaService.getById(idconsulta).subscribe({
        next: (data) => {
            this.consultaSeleccionada = data;
        },
        error: () => {
            this.consultaSeleccionada = null;
        },
        });
    }

    private validaConsulta(): string | null {
        const idconsulta = this.form.get('idconsulta')!.value;

        if (!idconsulta || idconsulta <= 0) {
            return 'Debe seleccionar una consulta para registrar el trámite.';
        }

        return null;
    }

    async onSubmit(): Promise<void> {
        const msgConsulta = this.validaConsulta();

        if (msgConsulta) {
            await this.notify.ok({
                variant: 'warning',
                title: 'Consulta requerida',
                message: msgConsulta,
                primaryText: 'Aceptar',
            });
            return;
        }

        this.trimEditableControls();
        this.form.updateValueAndValidity({ emitEvent: false });

        if (this.form.invalid) {
            this.form.markAllAsTouched();

            await this.notify.ok({
                variant: 'warning',
                title: 'Datos incompletos',
                message: 'Revisa los campos obligatorios. El asunto y el estado del trámite son obligatorios.',
                primaryText: 'Aceptar',
            });

            return;
        }

        this.submitting = true;

        try {
            const v = this.form.getRawValue();

            const vm: VMTramiteCreate = {
                idconsulta: v.idconsulta,

                expediente: v.expediente,
                entidad: v.entidad,
                asunto: v.asunto,
                descripcion: v.descripcion,

                estadoTramite: v.estadoTramite as EstadoTramite,

                fechaInicio: v.fechaInicio || null,
                fechaVencimiento: v.fechaVencimiento || null,
                fechaConclusion: v.fechaConclusion || null,

                observacion: v.observacion,
                fechaRegistrada: v.fechaRegistrada || null,
            };

            await this.tramiteService.create(vm);

            await this.notify.ok({
                variant: 'success',
                title: 'Trámite registrado',
                message: 'El trámite se creó correctamente.',
                primaryText: 'Aceptar',
            });

            this.router.navigate(this.backRoute());
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : 'No se pudo registrar el trámite.';

            await this.notify.ok({
                variant: 'warning',
                title: 'Datos inválidos',
                message,
                primaryText: 'Aceptar',
            });
            // El interceptor ya mostró el resto de errores.
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

    private trimEditableControls(): void {
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

    private backRoute(): any[] {
        const idciudadano = Number(this.route.snapshot.paramMap.get('idciudadano'));

        const idconsulta = Number(
        this.route.snapshot.paramMap.get('idconsulta') ??
        this.route.snapshot.paramMap.get('id')
        );

        if (idciudadano > 0 && idconsulta > 0) {
            return ['/ciudadano', idciudadano, 'consulta', idconsulta];
        }

        if (idconsulta > 0) {
            return ['/consulta', idconsulta];
        }

        return ['/tramite'];
    }

    nombreCiudadano(c: VMConsultaDetalleSimple | null): string {
        if (!c) return '—';

        return `${c.apellidoPaterno ?? ''} ${c.apellidoMaterno ?? ''}, ${c.nombres ?? ''}`
        .replace(/\s+/g, ' ')
        .trim();
    }
}

interface TramiteRegistrarForm {
    idconsulta: number;
    dniBusqueda: string;

    expediente: string;
    entidad: string;
    asunto: string;
    descripcion: string;
    estadoTramite: EstadoTramite | '';

    fechaInicio: string;
    fechaVencimiento: string;
    fechaConclusion: string;

    observacion: string;

    usarFechaRegistrada: boolean;
    fechaRegistrada: string;
}

type ControlsOf<T> = {
    [K in keyof T]: FormControl<T[K]>;
};