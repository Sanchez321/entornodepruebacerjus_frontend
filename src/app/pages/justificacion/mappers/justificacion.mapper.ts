import {
  ApiAsistenciaJustificacionItem,
  ApiAsistenciaJustificacionResumen,
  ApiPage,
} from '../models/justificacion.api';
import {
  DTOAsistenciaJustificacionCreate,
  DTOAsistenciaJustificacionListaOptions,
} from '../models/justificacion.dtos';
import {
  estadoJustificacionToLabel,
  resultadoJustificacionToLabel,
  tipoJustificacionToLabel,
} from '../models/justificacion.dominio';
import {
  VMAsistenciaJustificacionCreate,
  VMAsistenciaJustificacionItem,
  VMAsistenciaJustificacionListaOptions,
  VMAsistenciaJustificacionResumen,
  VMPage,
} from '../models/justificacion.vm';

export function MapJustificacionCreate(
  vm: VMAsistenciaJustificacionCreate,
): DTOAsistenciaJustificacionCreate {
  return {
    fecha_ymd: (vm.fecha_ymd ?? '').trim(),
    tipo: vm.tipo as DTOAsistenciaJustificacionCreate['tipo'],
    motivo: (vm.motivo ?? '').trim(),
    detalle: (vm.detalle ?? '').toString().trim() || null,
  };
}

export function MapJustificacionListaOpciones(
  vm: VMAsistenciaJustificacionListaOptions,
): DTOAsistenciaJustificacionListaOptions {
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    desde: vm.desde?.trim() || undefined,
    hasta: vm.hasta?.trim() || undefined,
    tipo: vm.tipo || undefined,
    estado: vm.estado || undefined,
    us_id: vm.us_id ?? undefined,
  } as DTOAsistenciaJustificacionListaOptions;
}

export function MapJustificacionItemVM(
  api: ApiAsistenciaJustificacionItem,
): VMAsistenciaJustificacionItem {
  return {
    aj_ID: api.aj_ID,
    us_id: api.aj_us_ID,
    usuarioNombre: api.usuario_nombre?.trim() || `Usuario #${api.aj_us_ID}`,
    usuarioDni: api.usuario_dni ?? null,
    fecha_ymd: api.aj_fecha_ymd,
    fecha_label: formatCalendarYmd(api.aj_fecha_ymd),
    zonaHoraria: api.aj_tz,
    tipo: api.aj_tipo,
    tipo_label: tipoJustificacionToLabel(api.aj_tipo),
    estado: api.aj_estado,
    estado_label: estadoJustificacionToLabel(api.aj_estado),
    resultado: api.aj_resultado ?? null,
    resultado_label: resultadoJustificacionToLabel(api.aj_resultado),
    incidencia: api.aj_incidencia ?? null,
    motivo: api.aj_motivo,
    detalle: api.aj_detalle ?? null,
    idAsistencia: api.aj_as_ID ?? null,
    idAsignacion: api.aj_uh_ID ?? null,
    horarioNombre: api.horario_nombre ?? null,
    horaInicioProgramada: api.hora_inicio_programada ?? null,
    horaFinProgramada: api.hora_fin_programada ?? null,
    horaEntrada: api.hora_entrada ?? null,
    horaSalida: api.hora_salida ?? null,
    asistenciaEstado: api.asistencia_estado ?? null,
    asistenciaEstadoLabel:
      api.asistencia_estado == null
        ? 'Sin asistencia'
        : api.asistencia_estado === 1
          ? 'Completa'
          : 'Incompleta',
    aprobadoPor: api.aj_aprobado_por ?? null,
    aprobadoPorNombre: api.aprobado_por_nombre ?? null,
    aprobadoEn: api.aj_aprobado_en ?? null,
    aprobadoEnLabel: api.aj_aprobado_en
      ? formatInstantPeru(api.aj_aprobado_en)
      : null,
    decisionMotivo: api.aj_decision_motivo ?? null,
    creadoEn: api.aj_creado_en,
    creadoEnLabel: formatInstantPeru(api.aj_creado_en),
  };
}

export function MapJustificacionResumenVM(
  api: ApiAsistenciaJustificacionResumen,
): VMAsistenciaJustificacionResumen {
  return {
    total: api.total,
    pendientes: api.pendientes,
    aprobadas: api.aprobadas,
    rechazadas: api.rechazadas,
    tardanzas: api.tardanzas,
    sinMarca: api.sin_marca,
    noProgramado: api.no_programado,
  };
}

export function MapPageToVM<TIn, TOut>(
  api: ApiPage<TIn>,
  mapItem: (item: TIn) => TOut,
): VMPage<TOut> {
  const items = (api.items ?? []).map(mapItem);
  return {
    items,
    total: api.total ?? items.length,
    page: api.page ?? 1,
    pageSize: api.pageSize ?? items.length,
  };
}

function formatCalendarYmd(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) return ymd;

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatInstantPeru(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  }).format(date);
}
