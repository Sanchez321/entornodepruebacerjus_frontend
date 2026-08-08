export type VMTipoMarca = 'Entrada' | 'Salida' | 'Desconocido';

export interface VMAsistenciaListaSimple {
  idmarcaasistencia: number;
  idmarca: number;
  tipo: VMTipoMarca;
  fechaIso: string;
  fecha_formato: string;
}

export interface VMHorarioHoy {
  idAsignacion: number;
  idHorario: number;
  nombre: string;
  diaSemana: string;
  diaSemanaLabel: string;
  horaInicio: string;
  horaFin: string;
  toleranciaMin: number;
}

export interface VMAsistenciaHoy {
  idAsistencia: number;
  estado: number;
  estadoLabel: string;
  entradaIso: string | null;
  salidaIso: string | null;
  entradaHoraLocal: string | null;
  salidaHoraLocal: string | null;
}

export interface VMMiHorarioHoy {
  fechaYmd: string;
  fechaLabel: string;
  zonaHoraria: string;
  programado: boolean;
  horario: VMHorarioHoy | null;
  asistencia: VMAsistenciaHoy | null;
  puedeMarcarEntrada: boolean;
  puedeMarcarSalida: boolean;
  puedeCorregirSalida: boolean;
  mensaje: string;
}

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VMAsistenciaListaOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  idAsistencia?: number;
}
