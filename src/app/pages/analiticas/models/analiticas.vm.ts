// src/app/pages/analiticas/models/analiticas.vm.ts

export type PeriodoTipo = 'week' | 'month' | 'year' | 'range';
export type PeriodView = 'day' | 'week' | 'month' | 'year';

export type AnalyticsExportDataset = 'todo';
export type AnalyticsExportFormato = 'xlsx';

export interface VMPeriodQuery {
  periodoTipo: PeriodoTipo;

  year?: number;
  month?: number;
  week?: number;

  start?: string;
  end?: string;

  view?: PeriodView;

  ci_id?: number;
  ci_ids?: number[];

  materia_id?: number;
  materia_ids?: number[];

  canal_id?: number;
  canal_ids?: number[];

  registrado_por_id?: number;
  registrado_por_ids?: number[];

  asesor_id?: number;
  asesor_ids?: number[];

  asesor_inicial_id?: number;
  asesor_inicial_ids?: number[];

  asesor_actual_id?: number;
  asesor_actual_ids?: number[];
}

export interface VMChartSerie {
  name: string;
  data: number[];
}

export interface VMLineaCiudadanos {
  categories: string[];
  nuevos: number[];
  acumulado: number[];
}

export interface VMBarrasApiladas {
  categories: string[];
  series: VMChartSerie[];
}

export interface VMPastelMaterias {
  labels: string[];
  series: number[];
}

export interface VMSerieSimple {
  categories: string[];
  series: VMChartSerie[];
}

export interface VMKpis {
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

export interface VMMateriaOtrosItem {
  materia: string;
  cantidad: number;
}

export interface VMCanalOtrosItem {
  canal: string;
  cantidad: number;
}

export interface VMCiudadanoEdad {
  fecha_alta: string | null;
  ci_id: number;
  ci_dni: string | null;
  ciudadano: string | null;
  fecha_nacimiento: string | null;
  edad: number | null;
  rango_edad: string | null;
  canal: string | null;
  registrado_por_id: number | null;
  registrado_por: string | null;
}

export interface VMEtlRunResponse {
  ok: boolean;
  runId?: number;
  preset?: string;
  adjustedToToday?: boolean;
  start: string;
  end: string;
}

export interface VMEtlStatus {
  running: boolean;
  runId?: number | null;

  lastRunAt?: string | null;
  lastStart?: string | null;
  lastEnd?: string | null;

  runningSince?: string | null;
  runningPreset?: string | null;
}

export interface VMDimMateria {
  materia_id: number;
  materia_nombre: string;
}

export interface VMDimCanal {
  canal_id: number;
  canal_nombre: string;
}

export interface VMDimUsuario {
  us_id: number;
  nombres: string;
  apellidos: string;
  activo: boolean;
}
