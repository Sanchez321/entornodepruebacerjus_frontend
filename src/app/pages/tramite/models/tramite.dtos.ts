// src/app/pages/tramite/models/tramite.dtos.ts

import { EstadoTramite } from './tramite.dominio';

export interface DTOTramiteListaOptions {
    page?: number;
    pageSize?: number;
    sort?: string;

    tr_ID?: string;
    tr_co_ID?: number;
    tr_ci_ID?: number;
    tr_ci_DNI?: string;

    tr_expediente?: string;
    tr_entidad?: string;
    tr_asunto?: string;
    tr_descripcion?: string;
    tr_estado_tramite?: EstadoTramite;

    tr_fecha_inicio?: string;
    tr_fecha_vencimiento?: string;
    tr_fecha_conclusion?: string;

    tr_observacion?: string;

    tr_estado?: number;
}

export interface DTOTramiteCreate {
    tr_fecha_registrada?: string | null;

    tr_co_ID: number;

    tr_expediente?: string;
    tr_entidad?: string;
    tr_asunto: string;
    tr_descripcion?: string;

    tr_estado_tramite: EstadoTramite;

    tr_fecha_inicio?: string | null;
    tr_fecha_vencimiento?: string | null;
    tr_fecha_conclusion?: string | null;

    tr_observacion?: string;
}

export interface DTOTramiteUpdate {
    tr_fecha_registrada?: string | null;

    tr_ID?: number;

    tr_expediente?: string;
    tr_entidad?: string;
    tr_tipo?: string;
    tr_asunto?: string;
    tr_descripcion?: string;

    tr_estado_tramite?: EstadoTramite;

    tr_fecha_inicio?: string | null;
    tr_fecha_vencimiento?: string | null;
    tr_fecha_conclusion?: string | null;

    tr_observacion?: string;
}