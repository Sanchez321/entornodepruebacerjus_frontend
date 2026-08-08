export type ApiMarcaTipo = 1 | 2;

export interface ApiAsistenciaListaSimple {
  ma_ID: number;
  ma_as_ID: number;
  ma_tipo: ApiMarcaTipo | number;
  ma_fecha: string;
}

export interface ApiAsistenciaPageSimple {
  items: ApiAsistenciaListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiHorarioHoy {
  uh_ID: number;
  ho_ID: number;
  nombre: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  tolerancia_min: number;
}

export interface ApiAsistenciaHoy {
  as_ID: number;
  as_estado: number;
  entrada_iso: string | null;
  salida_iso: string | null;
  entrada_hora_local: string | null;
  salida_hora_local: string | null;
}

export interface ApiMiHorarioHoyResponse {
  fecha_ymd: string;
  tz: string;
  programado: boolean;
  horario: ApiHorarioHoy | null;
  asistencia: ApiAsistenciaHoy | null;
  puede_marcar_entrada: boolean;
  puede_marcar_salida: boolean;
  puede_corregir_salida: boolean;
  mensaje: string;
}

export interface ApiPunchResponse {
  message: string;
  as_us_ID: number;
  asistencia: {
    as_ID: number;
    as_estado: number;
    as_tz: string;
    as_uh_ID: number | null;
    as_ho_ID: number | null;
  };
  marca: {
    ma_ID: number;
    ma_tipo: number;
    ma_fecha: string;
  };
  horario: {
    uh_ID: number;
    ho_ID: number;
    nombre: string;
    hora_inicio: string;
    hora_fin: string;
  } | null;
  correccion?: {
    mc_ID: number;
    fecha_anterior: string;
    fecha_nueva: string;
  } | null;
}
