export type AsistenciaPeriodoTipo =
  | 'week'
  | 'month'
  | 'year'
  | 'range';

export type AsistenciaView = 'day' | 'month';

export type AsistenciaTablaSegmento =
  | 'anteriores'
  | 'hoy'
  | 'proximos'
  | 'all';

export interface VMAsistenciaQuery {
  periodoTipo: AsistenciaPeriodoTipo;
  year?: number;
  month?: number;
  week?: number;
  start?: string;
  end?: string;
  view?: AsistenciaView;
  usId?: number | null;
}

export interface VMAsistenciaCards {
  programados: number;
  asistencias: number;
  completos: number;
  aTiempo: number;
  tardanzas: number;
  ausencias: number;
  incompletos: number;
  justificados: number;
  puntualidadPorcentaje: number;
  tardanzaPromedioMin: number;
  minutosTrabajados: number;
}

export interface VMBarrasAsistencia {
  categories: string[];
  series: Array<{
    name:
      | 'A tiempo'
      | 'Tarde'
      | 'Ausente'
      | 'Incompleto'
      | 'Programado';
    data: number[];
  }>;
  granularity: 'DAY' | 'MONTH';
}

export interface VMAsistenciaDashboard {
  cards: VMAsistenciaCards;
  barras: VMBarrasAsistencia;
  fechaDesde: string;
  fechaHasta: string;
  countHoy: number;
  countAnteriores: number;
  countProximos: number;
}

export interface VMEstadoActualRow {
  fechaYmd: string;
  fechaLabel: string;
  usId: number;
  dni: string | null;
  nombre: string;

  idAsistencia: number | null;
  horario: string;
  horaInicio: string | null;
  horaFin: string | null;
  horaEntrada: string | null;
  horaSalida: string | null;

  tardanzaMin: number | null;
  salidaAnticipadaMin: number | null;
  minutosProgramados: number | null;
  minutosTrabajados: number | null;
  minutosExtra: number | null;

  justificado: boolean;
  justificacionTipo: string | null;
  justificacionEstado: string | null;
  excluido: boolean;

  estadoLabel: string;
  estadoBadgeClass: string;
}

export interface VMAsistenciaPeriodoPage {
  segment: AsistenciaTablaSegmento;
  page: number;
  pageSize: number;
  total: number;
  countHoy: number;
  countAnteriores: number;
  countProximos: number;
  items: VMEstadoActualRow[];
}

export interface VMAsistenciaDimUsuario {
  usId: number;
  dni: string | null;
  nombre: string;
}

export interface VMAsistenciaEtlStatus {
  running: boolean;
  runId: number | null;
  runningPreset: string | null;
  runningSince: string | null;
  lastRunAt: string | null;
  lastStart: string | null;
  lastEnd: string | null;
  missingFrom: string | null;
  missingTo: string | null;
  hasMissing: boolean;
}
