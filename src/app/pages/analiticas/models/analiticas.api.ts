// src/app/pages/analiticas/models/analiticas.api.ts

export interface ApiSerieCiudadanos {
  periodo: string;
  nuevos: number;
  acumulado: number;
}

export interface ApiSerieAtenciones {
  periodo: string;
  consultas: number;
  seguimientos: number;
  total: number;
}

export interface ApiPastelMateriasItem {
  materia_id?: number;
  materia_nombre?: string;
  materia?: string;
  cantidad: number;
}

export type ApiPastelMaterias = ApiPastelMateriasItem[];

export interface ApiSerieProcesos {
  periodo: string;
  procesos: number;
}

export interface ApiSerieTramites {
  periodo: string;
  tramites: number;
}

export interface ApiSerieAudiencias {
  periodo: string;
  audiencias: number;
}

export interface ApiKpis {
  nuevos_ciudadanos: number;
  consultas: number;
  seguimientos: number;
  atenciones: number;
  procesos: number;
  tramites: number;
  audiencias: number;
  promedio_consultas_por_ciudadano: number;
  seguimientos_por_consulta: number;
}

export interface ApiMateriaOtrosItem {
  materia: string;
  cantidad: number;
}

export interface ApiCiudadanoEdadItem {
  fecha_alta: string | null;
  ci_id: number;
  ci_dni: string | null;
  ciudadano: string | null;
  fecha_nacimiento: string | null;
  canal: string | null;
  registrado_por_id: number | null;
  registrado_por: string | null;
}

export interface ApiEtlRunning {
  preset: string | null;
  status: string;
  start_date: string | Date;
  end_date: string | Date;
  year: number | null;
  month: number | null;
  started_at: string | Date;
  finished_at: string | Date | null;
  error_msg: string | null;
  id: number;
  parent_id: number | null;
}

export interface ApiEtlStatus {
  isRunning: boolean;
  running: ApiEtlRunning | null;

  lastSuccessStart: string | Date | null;
  lastSuccessEnd: string | Date | null;
  lastSuccessAt: string | Date | null;

  lastRunTodayAt: string | Date | null;
  minutesSinceLastRunToday: number | null;

  missingFrom: string | Date | null;
  missingTo: string | Date | null;
  hasMissing: boolean;

  todayRange?: Record<string, unknown>;
}
export interface ApiCanalOtrosItem {
  canal: string;
  cantidad: number;
}