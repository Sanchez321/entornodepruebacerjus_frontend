// src/app/pages/tramite/models/tramite.api.ts

import { EstadoTramite } from './tramite.dominio';

export interface ApiTramite {
    tr_ID: number;
    tr_co_ID: number;
    tr_ci_ID: number;
    tr_ci_DNI: string;

    tr_expediente?: string | null;
    tr_entidad?: string | null;
    tr_asunto: string;
    tr_descripcion?: string | null;

    tr_estado_tramite: EstadoTramite;

    tr_fecha_inicio?: Date | string | null;
    tr_fecha_vencimiento?: Date | string | null;
    tr_fecha_conclusion?: Date | string | null;

    tr_observacion?: string | null;

    tr_fecha_registrada?: Date | string | null;

    tr_creado_por?: number;
    tr_fecha_creado_por?: Date | string;
    tr_modificado_por?: number | null;
    tr_fecha_modificado_por?: Date | string | null;
    tr_estado_por?: number | null;
    tr_fecha_estado_por?: Date | string | null;
}

export type ApiTramiteListaSimple = Pick<ApiTramite,
    | 'tr_ID'
    | 'tr_co_ID'
    | 'tr_ci_ID'
    | 'tr_ci_DNI'
    | 'tr_expediente'
    | 'tr_entidad'
    | 'tr_asunto'
    | 'tr_descripcion'
    | 'tr_estado_tramite'
    | 'tr_fecha_inicio'
    | 'tr_fecha_vencimiento'
    | 'tr_fecha_conclusion'
    | 'tr_observacion'
>;

export type ApiTramiteDetalleSimple = ApiTramite;

export interface ApiTramitePageSimple {
    items: ApiTramiteListaSimple[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ApiTramiteControl {
    tr_ID: number;

    tr_creado_por: number;
    tr_creado_por_nombre?: string | null;
    tr_creado_por_dni?: string | null;
    tr_fecha_creado_por: Date | string;

    tr_modificado_por?: number | null;
    tr_modificado_por_nombre?: string | null;
    tr_modificado_por_dni?: string | null;
    tr_fecha_modificado_por?: Date | string | null;

    tr_estado_por?: number | null;
    tr_estado_por_nombre?: string | null;
    tr_estado_por_dni?: string | null;
    tr_fecha_estado_por?: Date | string | null;
}