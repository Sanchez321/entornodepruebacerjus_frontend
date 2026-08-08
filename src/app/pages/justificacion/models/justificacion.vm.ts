import {
  AsistenciaJustificacionEstado,
  AsistenciaJustificacionEstadoFiltro,
  AsistenciaJustificacionIncidencia,
  AsistenciaJustificacionResultado,
  AsistenciaJustificacionTipo,
  AsistenciaJustificacionTipoFiltro,
} from './justificacion.dominio';

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VMAsistenciaJustificacionCreate {
  fecha_ymd: string;
  tipo: AsistenciaJustificacionTipo;
  motivo: string;
  detalle?: string | null;
}

export interface VMAsistenciaJustificacionItem {
  aj_ID: number;
  us_id: number;

  usuarioNombre: string;
  usuarioDni: string | null;

  fecha_ymd: string;
  fecha_label: string;
  zonaHoraria: string;

  tipo: AsistenciaJustificacionTipo;
  tipo_label: string;

  estado: AsistenciaJustificacionEstado;
  estado_label: string;

  resultado: AsistenciaJustificacionResultado | null;
  resultado_label: string;

  incidencia: AsistenciaJustificacionIncidencia | null;

  motivo: string;
  detalle: string | null;

  idAsistencia: number | null;
  idAsignacion: number | null;

  horarioNombre: string | null;
  horaInicioProgramada: string | null;
  horaFinProgramada: string | null;

  horaEntrada: string | null;
  horaSalida: string | null;

  asistenciaEstado: number | null;
  asistenciaEstadoLabel: string;

  aprobadoPor: number | null;
  aprobadoPorNombre: string | null;

  aprobadoEn: string | null;
  aprobadoEnLabel: string | null;

  decisionMotivo: string | null;

  creadoEn: string;
  creadoEnLabel: string;
}

export interface VMAsistenciaJustificacionResumen {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  tardanzas: number;
  sinMarca: number;
  noProgramado: number;
}

export interface VMAsistenciaJustificacionListaOptions {
  page?: number;
  pageSize?: number;
  desde?: string;
  hasta?: string;
  tipo?: AsistenciaJustificacionTipoFiltro;
  estado?: AsistenciaJustificacionEstadoFiltro;
  us_id?: number;
}