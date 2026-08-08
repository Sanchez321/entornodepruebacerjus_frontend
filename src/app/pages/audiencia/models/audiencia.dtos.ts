// src/app/pages/audiencia/models/audiencia.dtos.ts

export interface DTOAudienciaListaOptions {
    page?: number;
    pageSize?: number;
    sort?: string;

    au_ID?: string;
    au_pr_ID?: number;
    au_co_ID?: number;
    au_ci_ID?: number;
    au_ci_DNI?: string;

    au_numero_expediente?: string;
    au_demandante?: string;
    au_abogado?: string;

    au_asesor_ID?: number;

    fecha_desde?: string;
    fecha_hasta?: string;

    au_estado_audiencia?: string;
    au_estado?: number;
}

export interface DTOAudienciaCreate {
    au_pr_ID: number;

    au_abogado: string;
    au_asesor_ID: number;

    au_fecha_hora_inicio: string;
    au_fecha_hora_fin?: string;

    au_enlace_meet?: string;
    au_titulo?: string;
    au_observacion?: string;
    au_estado_audiencia?: string;
}

export interface DTOAudienciaUpdate {
    au_ID?: number;

    au_abogado?: string;
    au_asesor_ID?: number;

    au_fecha_hora_inicio?: string;
    au_fecha_hora_fin?: string;

    au_enlace_meet?: string;
    au_titulo?: string;
    au_observacion?: string;
    au_estado_audiencia?: string;

    au_estado?: number;
}

export interface DTOAudienciaCalendarioSemanaOptions {
    fecha?: string;
}