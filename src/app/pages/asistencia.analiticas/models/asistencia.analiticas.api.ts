export type ApiBarName =
  | 'A tiempo'
  | 'Tarde'
  | 'Ausente'
  | 'Incompleto'
  | 'Programado';

export interface ApiAsistenciaCards {
  programados: number;
  asistencias: number;
  completos: number;
  a_tiempo: number;
  tardanzas: number;
  ausencias: number;
  incompletos: number;
  justificados: number;
  puntualidad_porcentaje: number;
  tardanza_promedio_min: number;
  minutos_trabajados: number;
}

export interface ApiAsistenciaBarras {
  granularity: 'DAY' | 'MONTH';
  categories: string[];
  series: Array<{ name: ApiBarName; data: number[] }>;
}

export interface ApiAsistenciaDashboardResponse {
  desde: string;
  hasta: string;
  cards: ApiAsistenciaCards;
  barras: ApiAsistenciaBarras;
  countHoy: number;
  countAnteriores: number;
  countProximos: number;
}

export interface ApiAsistenciaDiaUsuario {
  fecha_ymd: string;
  us_id: number;
  nombre: string;
  dni: string | null;

  as_id: number | null;
  uh_id: number | null;
  ho_id: number | null;
  horario_nombre: string | null;
  tz: string;

  hora_inicio_programada: string | null;
  hora_fin_programada: string | null;
  hora_entrada: string | null;
  hora_salida: string | null;

  programado: boolean;
  asistio: boolean;
  completo: boolean;
  incompleto: boolean;
  fue_tarde: boolean;
  tardanza_min: number | null;
  salida_anticipada_min: number | null;
  minutos_programados: number | null;
  minutos_trabajados: number | null;
  minutos_extra: number | null;
  fue_ausente: boolean;
  es_futuro: boolean;
  es_pendiente: boolean;

  justificado: boolean;
  justificacion_tipo: string | null;
  justificacion_estado: string | null;
  excluido: boolean;
  estado_visual: string;
}

export type ApiTablaSegmento = 'anteriores' | 'hoy' | 'proximos' | 'all';

export interface ApiAsistenciaPeriodoPageResponse {
  desde: string;
  hasta: string;
  segment: ApiTablaSegmento;
  page: number;
  pageSize: number;
  total: number;
  countHoy: number;
  countAnteriores: number;
  countProximos: number;
  items: ApiAsistenciaDiaUsuario[];
}

export interface ApiAsistenciaDimUsuario {
  us_id: number;
  dni: string | null;
  nombres: string;
  apellidos: string;
  activo: boolean;
}

export interface ApiAsistenciaEtlRun {
  id: number;
  preset: string;
  start_date: string | Date;
  end_date: string | Date;
  year: number | null;
  month: number | null;
  status: string;
  started_at: string | Date;
  finished_at: string | Date | null;
  error_msg: string | null;
}

export interface ApiAsistenciaEtlStatus {
  isRunning: boolean;
  running: ApiAsistenciaEtlRun | null;
  lastSuccessStart: string | Date | null;
  lastSuccessEnd: string | Date | null;
  lastSuccessAt: string | Date | null;
  missingFrom: string | Date | null;
  missingTo: string | Date | null;
  hasMissing: boolean;
  todayRange: { start: string; end: string };
}

export interface ApiAsistenciaEtlRunResponse {
  ok: boolean;
  runId: number;
  preset: string;
  start: string;
  end: string;
}
