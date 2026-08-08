// src/app/pages/audiencia/mappers/audiencia.mapper.ts

import {ApiAudienciaListaSimple,ApiAudienciaDetalleSimple,ApiAudienciaControl,ApiAudienciaCalendarioItem,ApiAudienciaCalendarioSemana,
    ApiAudienciaAsesorResumen,} from '../models/audiencia.api';
import {VMPage,VMAudienciaCreate,VMAudienciaDetalleSimple,VMAudienciaListaOptions,VMAudienciaListaSimple,VMAudienciaUpdate,
    VMAudienciaControl,VMAudienciaCalendarioItem,VMAudienciaCalendarioSemana,VMAudienciaCalendarioSemanaOptions,
    VMAudienciaAsesorResumen,} from '../models/audiencia.vm';

import {DTOAudienciaCreate,DTOAudienciaListaOptions,DTOAudienciaUpdate,DTOAudienciaCalendarioSemanaOptions,
    } from '../models/audiencia.dtos';

import {audienciaEstadoToLabel,resolverEstadoAudienciaVisual,estadoAudienciaVisualToLabel,} from '../models/audiencia.dominio';

export function MapAudienciaListaItemVM(a: ApiAudienciaListaSimple): VMAudienciaListaSimple {
    return {
        id: a.au_ID,

        idproceso: a.au_pr_ID,
        idconsulta: a.au_co_ID,
        idciudadano: a.au_ci_ID,
        dni: a.au_ci_DNI,

        numeroExpediente: a.au_numero_expediente,
        demandante: a.au_demandante,

        abogado: a.au_abogado,

        asesorId: a.au_asesor_ID,
        asesorNombre: a.au_asesor_nombre ?? null,

        fechaHoraInicio: a.au_fecha_hora_inicio,
        fechaHoraFin: a.au_fecha_hora_fin ?? null,

        enlaceMeet: a.au_enlace_meet ?? null,
        titulo: a.au_titulo ?? null,

        estadoAudiencia: a.au_estado_audiencia ?? null,
        estadoAudienciaTexto: estadoAudienciaVisualToLabel(
            resolverEstadoAudienciaVisual(
                a.au_fecha_hora_inicio,
                a.au_fecha_hora_fin,
                a.au_estado_audiencia,
            ),
        ),

        estado: a.au_estado,
        estadoTexto: audienciaEstadoToLabel(a.au_estado),
    };
}

export function MapAudienciaDetalleVM(a: ApiAudienciaDetalleSimple): VMAudienciaDetalleSimple {
    return {
        ...MapAudienciaListaItemVM(a),

        observacion: a.au_observacion ?? null,

        creadoPor: a.au_creado_por,
        fechaCreadoPor: a.au_fecha_creado_por,

        modificadoPor: a.au_modificado_por ?? null,
        fechaModificadoPor: a.au_fecha_modificado_por ?? null,

        estadoPor: a.au_estado_por ?? null,
        fechaEstadoPor: a.au_fecha_estado_por ?? null,
    };
}

export function MapAudienciaControl(a: ApiAudienciaControl): VMAudienciaControl {
    return {
        id: a.au_ID,

        creadoPor: a.au_creado_por,
        creadoPorNombre: a.au_creado_por_nombre ?? null,
        creadoPorDni: a.au_creado_por_dni ?? null,
        fechaCreadoPor: a.au_fecha_creado_por,

        modificadoPor: a.au_modificado_por ?? null,
        modificadoPorNombre: a.au_modificado_por_nombre ?? null,
        modificadoPorDni: a.au_modificado_por_dni ?? null,
        fechaModificadoPor: a.au_fecha_modificado_por ?? null,

        estadoPor: a.au_estado_por ?? null,
        estadoPorNombre: a.au_estado_por_nombre ?? null,
        estadoPorDni: a.au_estado_por_dni ?? null,
        fechaEstadoPor: a.au_fecha_estado_por ?? null,
    };
}
export function MapAudienciaAsesorResumen(a: ApiAudienciaAsesorResumen,): VMAudienciaAsesorResumen {
    const nombres = (a.us_nombres ?? '').trim();
    const apellidoPaterno = (a.us_apellido_p ?? '').trim();
    const apellidoMaterno = (a.us_apellido_m ?? '').trim();

    return {
        id: a.us_ID,
        dni: a.us_DNI,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        nombreCompleto: [nombres, apellidoPaterno, apellidoMaterno]
            .filter(Boolean)
            .join(' ') || '—',
    };
}
export function MapAudienciaCalendarioItemVM(a: ApiAudienciaCalendarioItem,): VMAudienciaCalendarioItem {
    return {
        id: a.au_ID,

        idproceso: a.au_pr_ID,
        idconsulta: a.au_co_ID,
        idciudadano: a.au_ci_ID,
        dni: a.au_ci_DNI,

        numeroExpediente: a.au_numero_expediente,
        demandante: a.au_demandante,

        abogado: a.au_abogado,

        asesorId: a.au_asesor_ID,
        asesorNombre: a.au_asesor_nombre ?? null,

        fechaHoraInicio: a.au_fecha_hora_inicio,
        fechaHoraFin: a.au_fecha_hora_fin ?? null,

        enlaceMeet: a.au_enlace_meet ?? null,
        titulo: a.au_titulo ?? null,

        estadoAudiencia: a.au_estado_audiencia ?? null,
        estadoAudienciaTexto: estadoAudienciaVisualToLabel(
            resolverEstadoAudienciaVisual(
                a.au_fecha_hora_inicio,
                a.au_fecha_hora_fin,
                a.au_estado_audiencia,
            ),
        ),

        estado: a.au_estado,
        estadoTexto: audienciaEstadoToLabel(a.au_estado),
    };
}

export function MapAudienciaCalendarioSemanaVM(a: ApiAudienciaCalendarioSemana,): VMAudienciaCalendarioSemana {
    return {
        tz: a.tz,
        fechaBase: a.fecha_base,
        semanaInicio: a.semana_inicio,
        semanaFin: a.semana_fin,
        items: (a.items ?? []).map(MapAudienciaCalendarioItemVM),
    };
}

export function MapAudienciaListaOpciones(vm: VMAudienciaListaOptions,): DTOAudienciaListaOptions {
    const trimU = (s?: string | null) => (s ?? '').trim();

    return {
        page: vm.page,
        pageSize: vm.pageSize,
        sort: vm.sort,

        au_ID: vm.id != null ? String(vm.id) : undefined,
        au_pr_ID: vm.idproceso ?? undefined,
        au_co_ID: vm.idconsulta ?? undefined,
        au_ci_ID: vm.idciudadano ?? undefined,
        au_ci_DNI: trimU(vm.dni),

        au_numero_expediente: trimU(vm.numeroExpediente),
        au_demandante: trimU(vm.demandante),
        au_abogado: trimU(vm.abogado),

        au_asesor_ID: vm.asesorId ?? undefined,

        fecha_desde: dateOnlyOrUndefined(vm.fechaDesde),
        fecha_hasta: dateOnlyOrUndefined(vm.fechaHasta),

        au_estado_audiencia: trimU(vm.estadoAudiencia),
        au_estado: vm.estado ?? undefined,
    };
}

export function MapAudienciaCalendarioSemanaOpciones(vm: VMAudienciaCalendarioSemanaOptions,): DTOAudienciaCalendarioSemanaOptions {
    return {
        fecha: dateOnlyOrUndefined(vm.fecha),
    };
}

export function MapAudienciaCreate(vm: VMAudienciaCreate): DTOAudienciaCreate {
    const dto: DTOAudienciaCreate = {
        au_pr_ID: vm.idproceso,

        au_abogado: toUpperSafeRequired(vm.abogado),
        au_asesor_ID: vm.asesorId,

        au_fecha_hora_inicio: dateTimeIsoRequired(vm.fechaHoraInicio),
        au_fecha_hora_fin: dateTimeIsoOrUndefined(vm.fechaHoraFin),

        au_enlace_meet: optionalTrim(vm.enlaceMeet),
        au_titulo: optionalUpper(vm.titulo),
        au_observacion: optionalUpper(vm.observacion),
    };

    if (vm.estadoAudiencia != null) {
        dto.au_estado_audiencia = optionalUpper(vm.estadoAudiencia);
    }

    return dto;
}

export function MapAudienciaUpdateParcial(_id: number,vm: Partial<VMAudienciaUpdate>,): DTOAudienciaUpdate {
    const dto: DTOAudienciaUpdate = {};

    if (vm.abogado != null) dto.au_abogado = toUpperSafeRequired(vm.abogado);
    if (vm.asesorId != null) dto.au_asesor_ID = vm.asesorId;

    if (vm.fechaHoraInicio != null) dto.au_fecha_hora_inicio = dateTimeIsoRequired(vm.fechaHoraInicio);
    if (vm.fechaHoraFin !== undefined) dto.au_fecha_hora_fin = dateTimeIsoOrUndefined(vm.fechaHoraFin);

    if (vm.enlaceMeet != null) dto.au_enlace_meet = optionalTrim(vm.enlaceMeet);
    if (vm.titulo != null) dto.au_titulo = optionalUpper(vm.titulo);
    if (vm.observacion != null) dto.au_observacion = optionalUpper(vm.observacion);

    if (vm.estadoAudiencia !== undefined) {
        dto.au_estado_audiencia = optionalUpper(vm.estadoAudiencia) ?? '';
    }
    if (vm.estado != null) dto.au_estado = vm.estado;

    return dto;
}

export function MapPageToVM<TIn, TOut>(
    api: { items?: TIn[]; total?: number; page?: number; pageSize?: number },
    mapItem: (x: TIn) => TOut,
): VMPage<TOut> {
    const items = (api.items ?? []).map(mapItem);

    return {
        items,
        total: api.total ?? items.length,
        page: api.page ?? 1,
        pageSize: api.pageSize ?? (items.length | 0),
    };
}

function toUpperSafeRequired(s?: string | null): string {
    const v = (s ?? '').trim();

    if (!v) {
        throw new Error('Hay campos obligatorios vacíos.');
    }

    return v.toUpperCase();
}

function optionalUpper(s?: string | null): string | undefined {
    const v = (s ?? '').trim();
    return v ? v.toUpperCase() : undefined;
}

function optionalTrim(s?: string | null): string | undefined {
    const v = (s ?? '').trim();
    return v ? v : undefined;
}

function dateOnlyOrUndefined(value?: Date | string | null): string | undefined {
    if (!value) return undefined;

    if (value instanceof Date) {
        if (isNaN(value.getTime())) return undefined;
        return value.toISOString().slice(0, 10);
    }

    const v = String(value).trim();
    if (!v) return undefined;

    return v.length >= 10 ? v.slice(0, 10) : v;
}

function dateTimeIsoRequired(value?: Date | string | null): string {
    const v = dateTimeIsoOrUndefined(value);

    if (!v) {
        throw new Error('Hay campos obligatorios vacíos.');
    }

    return v;
}

function dateTimeIsoOrUndefined(value?: Date | string | null): string | undefined {
    if (!value) return undefined;

    if (value instanceof Date) {
        if (isNaN(value.getTime())) return undefined;
        return value.toISOString();
    }

    const v = String(value).trim();
    if (!v) return undefined;

    const d = new Date(v);
    if (isNaN(d.getTime())) return undefined;

    return d.toISOString();
}