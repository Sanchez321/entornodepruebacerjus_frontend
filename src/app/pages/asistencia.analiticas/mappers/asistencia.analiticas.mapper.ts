import {
  ApiAsistenciaDashboardResponse,
  ApiAsistenciaDiaUsuario,
  ApiAsistenciaDimUsuario,
  ApiAsistenciaEtlStatus,
  ApiAsistenciaPeriodoPageResponse,
} from '../models/asistencia.analiticas.api';
import {
  VMAsistenciaDashboard,
  VMAsistenciaDimUsuario,
  VMAsistenciaEtlStatus,
  VMAsistenciaPeriodoPage,
  VMEstadoActualRow,
  VMBarrasAsistencia,
} from '../models/asistencia.analiticas.vm';

function fmtDiaCorto(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function fmtMesCorto(ym: string): string {
  const [year, month] = ym.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat('es-PE', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function mapBarras(api: ApiAsistenciaDashboardResponse): VMBarrasAsistencia {
  const granularity = api.barras.granularity;

  return {
    granularity,
    categories: api.barras.categories.map((category) =>
      granularity === 'MONTH'
        ? fmtMesCorto(category)
        : fmtDiaCorto(category),
    ),
    series: api.barras.series,
  };
}

export function mapAsistenciaDashboard(
  api: ApiAsistenciaDashboardResponse,
): VMAsistenciaDashboard {
  return {
    cards: {
      programados: api.cards.programados,
      asistencias: api.cards.asistencias,
      completos: api.cards.completos,
      aTiempo: api.cards.a_tiempo,
      tardanzas: api.cards.tardanzas,
      ausencias: api.cards.ausencias,
      incompletos: api.cards.incompletos,
      justificados: api.cards.justificados,
      puntualidadPorcentaje: api.cards.puntualidad_porcentaje,
      tardanzaPromedioMin: api.cards.tardanza_promedio_min,
      minutosTrabajados: api.cards.minutos_trabajados,
    },
    barras: mapBarras(api),
    fechaDesde: api.desde,
    fechaHasta: api.hasta,
    countHoy: api.countHoy,
    countAnteriores: api.countAnteriores,
    countProximos: api.countProximos,
  };
}

export function mapAsistenciaPeriodoPage(
  api: ApiAsistenciaPeriodoPageResponse,
): VMAsistenciaPeriodoPage {
  return {
    segment: api.segment,
    page: api.page,
    pageSize: api.pageSize,
    total: api.total,
    countHoy: api.countHoy,
    countAnteriores: api.countAnteriores,
    countProximos: api.countProximos,
    items: (api.items ?? []).map(mapEstadoRow),
  };
}

export function mapAsistenciaDimUsuarios(
  rows: ApiAsistenciaDimUsuario[],
): VMAsistenciaDimUsuario[] {
  return (rows ?? []).map((row) => ({
    usId: row.us_id,
    dni: row.dni ?? null,
    nombre: `${row.nombres ?? ''} ${row.apellidos ?? ''}`
      .replace(/\s+/g, ' ')
      .trim(),
  }));
}

export function mapAsistenciaEtlStatus(
  api: ApiAsistenciaEtlStatus,
): VMAsistenciaEtlStatus {
  return {
    running: !!api.isRunning,
    runId: api.running?.id ?? null,
    runningPreset: api.running?.preset ?? null,
    runningSince: instantIso(api.running?.started_at),
    lastRunAt: instantIso(api.lastSuccessAt),
    lastStart: calendarYmd(api.lastSuccessStart),
    lastEnd: calendarYmd(api.lastSuccessEnd),
    missingFrom: calendarYmd(api.missingFrom),
    missingTo: calendarYmd(api.missingTo),
    hasMissing: !!api.hasMissing,
  };
}

function mapEstadoRow(row: ApiAsistenciaDiaUsuario): VMEstadoActualRow {
  const estadoLabel = row.estado_visual || deriveEstado(row);

  return {
    fechaYmd: row.fecha_ymd,
    fechaLabel: fmtDiaCorto(row.fecha_ymd),
    usId: row.us_id,
    dni: row.dni ?? null,
    nombre: row.nombre?.trim() || `Usuario #${row.us_id}`,
    idAsistencia: row.as_id,
    horario: row.horario_nombre ?? (row.programado ? 'Horario activo' : 'Sin horario'),
    horaInicio: row.hora_inicio_programada,
    horaFin: row.hora_fin_programada,
    horaEntrada: row.hora_entrada,
    horaSalida: row.hora_salida,
    tardanzaMin: row.tardanza_min,
    salidaAnticipadaMin: row.salida_anticipada_min,
    minutosProgramados: row.minutos_programados,
    minutosTrabajados: row.minutos_trabajados,
    minutosExtra: row.minutos_extra,
    justificado: row.justificado,
    justificacionTipo: row.justificacion_tipo,
    justificacionEstado: row.justificacion_estado,
    excluido: row.excluido,
    estadoLabel,
    estadoBadgeClass: estadoClass(estadoLabel),
  };
}

function deriveEstado(row: ApiAsistenciaDiaUsuario): string {
  if (row.excluido) return 'NO PROGRAMADO JUSTIFICADO';
  if (!row.programado) return 'SIN HORARIO';
  if (row.incompleto) return 'INCOMPLETO';
  if (row.asistio) return row.fue_tarde ? 'TARDE' : 'A TIEMPO';
  if (row.fue_ausente) return 'AUSENTE';
  if (row.es_futuro) return 'PROGRAMADO';
  if (row.es_pendiente) return 'AÚN NO INICIA';
  return 'PROGRAMADO';
}

function estadoClass(value: string): string {
  const normalized = value.toUpperCase();

  if (normalized === 'A TIEMPO') return 'badge-ok';
  if (normalized === 'TARDE') return 'badge-warn';
  if (normalized === 'AUSENTE') return 'badge-danger';
  if (normalized === 'INCOMPLETO') return 'badge-warn-soft';
  if (normalized.includes('JUSTIFICADO')) return 'badge-justified';
  if (normalized === 'PROGRAMADO' || normalized === 'AÚN NO INICIA') {
    return 'badge-info';
  }

  return 'badge-muted';
}

function calendarYmd(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function instantIso(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
