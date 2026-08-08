import {
  ApiAsistenciaListaSimple,
  ApiMiHorarioHoyResponse,
} from '../models/asistencia.api';
import { DTOAsistenciaListaOptions } from '../models/asistencia.dto';
import {
  VMAsistenciaListaOptions,
  VMAsistenciaListaSimple,
  VMMiHorarioHoy,
  VMPage,
  VMTipoMarca,
} from '../models/asistencia.vm';

const UI_TZ = 'America/Lima';

export function MapAsistenciaListaItemVM(
  api: ApiAsistenciaListaSimple,
): VMAsistenciaListaSimple {
  return {
    idmarcaasistencia: Number(api.ma_as_ID),
    idmarca: Number(api.ma_ID),
    tipo: marcaTipoLabel(api.ma_tipo),
    fechaIso: api.ma_fecha,
    fecha_formato: formatInstantPeru(api.ma_fecha),
  };
}

export function MapMiHorarioHoyVM(
  api: ApiMiHorarioHoyResponse,
): VMMiHorarioHoy {
  return {
    fechaYmd: api.fecha_ymd,
    fechaLabel: formatCalendarYmd(api.fecha_ymd),
    zonaHoraria: api.tz,
    programado: api.programado,
    horario: api.horario
      ? {
          idAsignacion: api.horario.uh_ID,
          idHorario: api.horario.ho_ID,
          nombre: api.horario.nombre,
          diaSemana: api.horario.dia_semana,
          diaSemanaLabel: diaSemanaLabel(api.horario.dia_semana),
          horaInicio: api.horario.hora_inicio,
          horaFin: api.horario.hora_fin,
          toleranciaMin: api.horario.tolerancia_min,
        }
      : null,
    asistencia: api.asistencia
      ? {
          idAsistencia: api.asistencia.as_ID,
          estado: api.asistencia.as_estado,
          estadoLabel:
            api.asistencia.as_estado === 1 ? 'Completa' : 'Incompleta',
          entradaIso: api.asistencia.entrada_iso,
          salidaIso: api.asistencia.salida_iso,
          entradaHoraLocal: api.asistencia.entrada_hora_local,
          salidaHoraLocal: api.asistencia.salida_hora_local,
        }
      : null,
    puedeMarcarEntrada: api.puede_marcar_entrada,
    puedeMarcarSalida: api.puede_marcar_salida,
    puedeCorregirSalida: api.puede_corregir_salida,
    mensaje: api.mensaje,
  };
}

export function MapAsistenciaListaOpciones(
  vm: VMAsistenciaListaOptions,
): DTOAsistenciaListaOptions {
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    sort: vm.sort,
    ma_as_ID: vm.idAsistencia,
  };
}

export function MapPageToVM<TIn, TOut>(
  api: {
    items?: TIn[];
    total?: number;
    page?: number;
    pageSize?: number;
  },
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

function marcaTipoLabel(tipo: number): VMTipoMarca {
  if (tipo === 1) return 'Entrada';
  if (tipo === 2) return 'Salida';
  return 'Desconocido';
}

function formatInstantPeru(value?: string | Date | null): string {
  if (!value) return '—';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: UI_TZ,
  }).format(date);
}

function formatCalendarYmd(ymd: string): string {
  const match = /^\d{4}-\d{2}-\d{2}$/.test(ymd);
  if (!match) return ymd || '—';

  const [year, month, day] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function diaSemanaLabel(value: string): string {
  const labels: Record<string, string> = {
    LU: 'Lunes',
    MA: 'Martes',
    MI: 'Miércoles',
    JU: 'Jueves',
    VI: 'Viernes',
    SA: 'Sábado',
    DO: 'Domingo',
  };

  return labels[value] ?? value;
}
