// src/app/pages/audiencia/models/audiencia.api.ts

export interface ApiAudiencia {
    au_ID: number;

    au_pr_ID: number;
    au_co_ID: number;
    au_ci_ID: number;
    au_ci_DNI: string;

    au_numero_expediente: string;
    au_demandante: string;

    au_abogado: string;

    au_asesor_ID: number;
    au_asesor_nombre?: string | null;

    au_fecha_hora_inicio: Date | string;
    au_fecha_hora_fin?: Date | string | null;

    au_enlace_meet?: string | null;
    au_titulo?: string | null;
    au_estado_audiencia?: string | null;

    au_observacion?: string | null;

    au_estado: number;

    au_creado_por?: number;
    au_fecha_creado_por?: Date | string;
    au_modificado_por?: number | null;
    au_fecha_modificado_por?: Date | string | null;
    au_estado_por?: number | null;
    au_fecha_estado_por?: Date | string | null;
}

export type ApiAudienciaListaSimple = Pick<ApiAudiencia,
    | 'au_ID'
    | 'au_pr_ID'
    | 'au_co_ID'
    | 'au_ci_ID'
    | 'au_ci_DNI'
    | 'au_numero_expediente'
    | 'au_demandante'
    | 'au_abogado'
    | 'au_asesor_ID'
    | 'au_asesor_nombre'
    | 'au_fecha_hora_inicio'
    | 'au_fecha_hora_fin'
    | 'au_enlace_meet'
    | 'au_titulo'
    | 'au_estado_audiencia'
    | 'au_estado'
>;

export type ApiAudienciaDetalleSimple = ApiAudiencia;

export interface ApiAudienciaPageSimple {
    items: ApiAudienciaListaSimple[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ApiAudienciaControl {
    au_ID: number;

    au_creado_por: number;
    au_creado_por_nombre?: string | null;
    au_creado_por_dni?: string | null;
    au_fecha_creado_por: Date | string;

    au_modificado_por?: number | null;
    au_modificado_por_nombre?: string | null;
    au_modificado_por_dni?: string | null;
    au_fecha_modificado_por?: Date | string | null;

    au_estado_por?: number | null;
    au_estado_por_nombre?: string | null;
    au_estado_por_dni?: string | null;
    au_fecha_estado_por?: Date | string | null;
}

export interface ApiAudienciaCalendarioItem {
    au_ID: number;

    au_pr_ID: number;
    au_co_ID: number;
    au_ci_ID: number;
    au_ci_DNI: string;

    au_numero_expediente: string;
    au_demandante: string;

    au_abogado: string;

    au_asesor_ID: number;
    au_asesor_nombre?: string | null;

    au_fecha_hora_inicio: Date | string;
    au_fecha_hora_fin?: Date | string | null;

    au_enlace_meet?: string | null;
    au_titulo?: string | null;
    au_estado_audiencia?: string | null;

    au_estado: number;
}

export interface ApiAudienciaCalendarioSemana {
    tz: string;
    fecha_base: string;
    semana_inicio: string;
    semana_fin: string;
    items: ApiAudienciaCalendarioItem[];
}
export interface ApiAudienciaAsesorResumen {
    us_ID: number;
    us_DNI: string;
    us_nombres: string;
    us_apellido_p: string;
    us_apellido_m: string;
}