// src/app/pages/tramite/mappers/tramite.mapper.ts

import {ApiTramiteListaSimple,ApiTramiteDetalleSimple,ApiTramiteControl,} from '../models/tramite.api';
import {VMPage,VMTramiteCreate,VMTramiteDetalleSimple,VMTramiteListaOptions,VMTramiteListaSimple,VMTramiteUpdate,VMTramiteControl,
    } from '../models/tramite.vm';
import {DTOTramiteCreate,DTOTramiteListaOptions,DTOTramiteUpdate,} from '../models/tramite.dtos';
import { estadoTramiteToLabel } from '../models/tramite.dominio';

export function MapTramiteListaItemVM(a: ApiTramiteListaSimple): VMTramiteListaSimple {
    return {
        id: a.tr_ID,
        idconsulta: a.tr_co_ID,
        idciudadano: a.tr_ci_ID,
        dni: a.tr_ci_DNI,

        expediente: a.tr_expediente ?? null,
        entidad: a.tr_entidad ?? null,
        asunto: a.tr_asunto,
        descripcion: a.tr_descripcion ?? null,

        estadoTramite: a.tr_estado_tramite,
        estadoTramiteTexto: estadoTramiteToLabel(a.tr_estado_tramite),
        fechaInicio: a.tr_fecha_inicio
                ? String(a.tr_fecha_inicio).slice(0, 10)
                : null,
        fechaVencimiento: a.tr_fecha_vencimiento
                ? String(a.tr_fecha_vencimiento).slice(0, 10)
                : null,
        fechaConclusion: a.tr_fecha_conclusion
                ? String(a.tr_fecha_conclusion).slice(0, 10)
                : null,


        observacion: a.tr_observacion ?? null,
    };
}

export function MapTramiteDetalleVM(a: ApiTramiteDetalleSimple): VMTramiteDetalleSimple {
    return {
        ...MapTramiteListaItemVM(a),

        fechaRegistrada: a.tr_fecha_registrada
            ? String(a.tr_fecha_registrada).slice(0, 10)
            : null,

        creadoPor: a.tr_creado_por,
        fechaCreadoPor: a.tr_fecha_creado_por,

        modificadoPor: a.tr_modificado_por ?? null,
        fechaModificadoPor: a.tr_fecha_modificado_por ?? null,

        estadoPor: a.tr_estado_por ?? null,
        fechaEstadoPor: a.tr_fecha_estado_por ?? null,
    };
}

export function MapTramiteControl(a: ApiTramiteControl): VMTramiteControl {
    return {
        id: a.tr_ID,

        creadoPor: a.tr_creado_por,
        creadoPorNombre: a.tr_creado_por_nombre ?? null,
        creadoPorDni: a.tr_creado_por_dni ?? null,
        fechaCreadoPor: a.tr_fecha_creado_por,

        modificadoPor: a.tr_modificado_por ?? null,
        modificadoPorNombre: a.tr_modificado_por_nombre ?? null,
        modificadoPorDni: a.tr_modificado_por_dni ?? null,
        fechaModificadoPor: a.tr_fecha_modificado_por ?? null,

        estadoPor: a.tr_estado_por ?? null,
        estadoPorNombre: a.tr_estado_por_nombre ?? null,
        estadoPorDni: a.tr_estado_por_dni ?? null,
        fechaEstadoPor: a.tr_fecha_estado_por ?? null,
    };
}

export function MapTramiteListaOpciones(vm: VMTramiteListaOptions): DTOTramiteListaOptions {
    const trimU = (s?: string | null) => (s ?? '').trim();

    return {
        page: vm.page,
        pageSize: vm.pageSize,
        sort: vm.sort,

        tr_ID: vm.id != null ? String(vm.id) : undefined,
        tr_co_ID: vm.idconsulta ?? undefined,
        tr_ci_ID: vm.idciudadano ?? undefined,
        tr_ci_DNI: trimU(vm.dni),

        tr_expediente: trimU(vm.expediente),
        tr_entidad: trimU(vm.entidad),
        tr_asunto: trimU(vm.asunto),
        tr_descripcion: trimU(vm.descripcion),
        tr_estado_tramite: vm.estadoTramite ?? undefined,

        tr_fecha_inicio: vm.fechaInicio
            ? new Date(vm.fechaInicio).toISOString()
            : undefined,

        tr_fecha_vencimiento: vm.fechaVencimiento
            ? new Date(vm.fechaVencimiento).toISOString()
            : undefined,

        tr_fecha_conclusion: vm.fechaConclusion
            ? new Date(vm.fechaConclusion).toISOString()
            : undefined,
        
        tr_observacion: trimU(vm.observacion),
    };
}

export function MapTramiteCreate(vm: VMTramiteCreate): DTOTramiteCreate {
    const dto: DTOTramiteCreate = {
        tr_co_ID: vm.idconsulta,

        tr_expediente: optionalUpper(vm.expediente),
        tr_entidad: optionalUpper(vm.entidad),

        tr_asunto: toUpperSafeRequired(vm.asunto),
        tr_descripcion: optionalUpper(vm.descripcion),

        tr_estado_tramite: vm.estadoTramite,

        tr_observacion: optionalUpper(vm.observacion),
    };
    if (vm.fechaInicio) {
        dto.tr_fecha_inicio = new Date(vm.fechaInicio).toISOString();
    }

    if (vm.fechaVencimiento) {
        dto.tr_fecha_vencimiento = new Date(vm.fechaVencimiento).toISOString();
    }

    if (vm.fechaConclusion) {
        dto.tr_fecha_conclusion = new Date(vm.fechaConclusion).toISOString();
    }
    if (vm.fechaRegistrada) {
        dto.tr_fecha_registrada = new Date(vm.fechaRegistrada).toISOString();
    }

    return dto;
}

export function MapTramiteUpdateParcial(_id: number,vm: Partial<VMTramiteUpdate>,): DTOTramiteUpdate {
        const dto: DTOTramiteUpdate = {};

        if (vm.expediente != null) dto.tr_expediente = optionalUpper(vm.expediente);
        if (vm.entidad != null) dto.tr_entidad = optionalUpper(vm.entidad);

        if (vm.asunto != null) dto.tr_asunto = toUpperSafeRequired(vm.asunto);
        if (vm.descripcion != null) dto.tr_descripcion = optionalUpper(vm.descripcion);

        if (vm.estadoTramite != null) dto.tr_estado_tramite = vm.estadoTramite;

        if (vm.fechaInicio !== undefined) {
            dto.tr_fecha_inicio = vm.fechaInicio
                ? new Date(vm.fechaInicio).toISOString()
                : null;
        }
        if (vm.fechaVencimiento !== undefined) {
            dto.tr_fecha_vencimiento = vm.fechaVencimiento
                ? new Date(vm.fechaVencimiento).toISOString()
                : null;
        }
        if (vm.fechaConclusion !== undefined) {
            dto.tr_fecha_conclusion = vm.fechaConclusion
                ? new Date(vm.fechaConclusion).toISOString()
                : null;
        }

        if (vm.observacion != null) dto.tr_observacion = optionalUpper(vm.observacion);

        if (vm.fechaRegistrada !== undefined) {
            dto.tr_fecha_registrada = vm.fechaRegistrada
                ? new Date(vm.fechaRegistrada).toISOString()
                : null;
        }

        return dto;
}

export function MapPageToVM<TIn, TOut>(api: { items?: TIn[]; total?: number; page?: number; pageSize?: number },
    mapItem: (x: TIn) => TOut,): VMPage<TOut> {

    const items = (api.items ?? []).map(mapItem);

    return {
        items,
        total: api.total ?? items.length,
        page: api.page ?? 1,
        pageSize: api.pageSize ?? items.length | 0,
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
