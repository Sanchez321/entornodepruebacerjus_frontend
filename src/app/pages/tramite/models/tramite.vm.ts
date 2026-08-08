// src/app/pages/tramite/models/tramite.vm.ts

import { EstadoTramite } from './tramite.dominio';

export interface VMTramite {
    id: number;
    idconsulta: number;
    idciudadano: number;
    dni: string;

    expediente?: string | null;
    entidad?: string | null;
    asunto: string;
    descripcion?: string | null;

    estadoTramite: EstadoTramite;
    estadoTramiteTexto?: string;

    fechaInicio?:  string | null;
    fechaVencimiento?: string | null;
    fechaConclusion?:  string | null;

    observacion?: string | null;
    fechaRegistrada?: string | null;

    creadoPor?: number;
    fechaCreadoPor?: Date | string;
    modificadoPor?: number | null;
    fechaModificadoPor?: Date | string | null;
    estadoPor?: number | null;
    fechaEstadoPor?: Date | string | null;
}

export type VMTramiteListaSimple = Pick<VMTramite,
    | 'id'
    | 'idconsulta'
    | 'idciudadano'
    | 'dni'
    | 'expediente'
    | 'entidad'
    | 'asunto'
    | 'descripcion'
    | 'estadoTramite'
    | 'estadoTramiteTexto'
    | 'fechaInicio'
    | 'fechaVencimiento'
    | 'fechaConclusion'
    | 'observacion'
>;

export type VMTramiteDetalleSimple = VMTramite;

export type VMTramiteCreate = Pick<VMTramite,
    | 'idconsulta'
    | 'expediente'
    | 'entidad'
    | 'asunto'
    | 'descripcion'
    | 'estadoTramite'
    | 'fechaInicio'
    | 'fechaVencimiento'
    | 'fechaConclusion'
    | 'observacion'
> & {
    fechaRegistrada?: string | null;
};

export type VMTramiteUpdate = Partial<Pick<VMTramite,
    | 'expediente'
    | 'entidad'
    | 'asunto'
    | 'descripcion'
    | 'estadoTramite'
    | 'fechaInicio'
    | 'fechaVencimiento'
    | 'fechaConclusion'
    | 'observacion'
>> & {
    fechaRegistrada?: string | null;
};

export interface VMPage<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export type VMTramiteListaOptions = Partial<VMTramiteListaSimple> & {
    page?: number;
    pageSize?: number;
    sort?: string;
};

export interface VMTramiteControl {
    id: number;

    creadoPor: number;
    creadoPorNombre?: string | null;
    creadoPorDni?: string | null;
    fechaCreadoPor: Date | string;

    modificadoPor?: number | null;
    modificadoPorNombre?: string | null;
    modificadoPorDni?: string | null;
    fechaModificadoPor?: Date | string | null;

    estadoPor?: number | null;
    estadoPorNombre?: string | null;
    estadoPorDni?: string | null;
    fechaEstadoPor?: Date | string | null;
}