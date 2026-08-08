// src/app/pages/audiencia/models/audiencia.vm.ts

export interface VMAudiencia {
    id: number;

    idproceso: number;
    idconsulta: number;
    idciudadano: number;
    dni: string;

    numeroExpediente: string;
    demandante: string;

    abogado: string;

    asesorId: number;
    asesorNombre?: string | null;

    fechaHoraInicio: Date | string;
    fechaHoraFin?: Date | string | null;

    enlaceMeet?: string | null;
    titulo?: string | null;
    estadoAudiencia?: string | null;
    estadoAudienciaTexto?: string;

    observacion?: string | null;

    estado: number;
    estadoTexto?: string;

    creadoPor?: number;
    fechaCreadoPor?: Date | string;
    modificadoPor?: number | null;
    fechaModificadoPor?: Date | string | null;
    estadoPor?: number | null;
    fechaEstadoPor?: Date | string | null;
}

export type VMAudienciaListaSimple = Pick<VMAudiencia,
    | 'id'
    | 'idproceso'
    | 'idconsulta'
    | 'idciudadano'
    | 'dni'
    | 'numeroExpediente'
    | 'demandante'
    | 'abogado'
    | 'asesorId'
    | 'asesorNombre'
    | 'fechaHoraInicio'
    | 'fechaHoraFin'
    | 'enlaceMeet'
    | 'titulo'
    | 'estadoAudiencia'
    | 'estadoAudienciaTexto'
    | 'estado'
    | 'estadoTexto'
>;

export type VMAudienciaDetalleSimple = VMAudiencia;

export type VMAudienciaCalendarioItem = Pick<VMAudiencia,
    | 'id'
    | 'idproceso'
    | 'idconsulta'
    | 'idciudadano'
    | 'dni'
    | 'numeroExpediente'
    | 'demandante'
    | 'abogado'
    | 'asesorId'
    | 'asesorNombre'
    | 'fechaHoraInicio'
    | 'fechaHoraFin'
    | 'enlaceMeet'
    | 'titulo'
    | 'estadoAudiencia'
    | 'estadoAudienciaTexto'
    | 'estado'
    | 'estadoTexto'
>;

export interface VMAudienciaCalendarioSemana {
    tz: string;
    fechaBase: string;
    semanaInicio: string;
    semanaFin: string;
    items: VMAudienciaCalendarioItem[];
}

export type VMAudienciaCreate = Pick<VMAudiencia,
    | 'idproceso'
    | 'abogado'
    | 'asesorId'
    | 'fechaHoraInicio'
    | 'fechaHoraFin'
    | 'enlaceMeet'
    | 'titulo'
    | 'observacion'
> & {
    estadoAudiencia?: string | null;
};

export type VMAudienciaUpdate = Partial<Pick<VMAudiencia,
    | 'abogado'
    | 'asesorId'
    | 'fechaHoraInicio'
    | 'fechaHoraFin'
    | 'enlaceMeet'
    | 'titulo'
    | 'observacion'
    | 'estadoAudiencia'
    | 'estado'
>>;

export interface VMPage<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export type VMAudienciaListaOptions = Partial<VMAudienciaListaSimple> & {
    page?: number;
    pageSize?: number;
    sort?: string;
    fechaDesde?: Date | string | null;
    fechaHasta?: Date | string | null;
};

export interface VMAudienciaCalendarioSemanaOptions {
    fecha?: Date | string | null;
}

export interface VMAudienciaControl {
    id: number;

    creadoPor: number;
    creadoPorNombre?: string | null;
    creadoPorDni?: string | null;
    fechaCreadoPor: Date | string;

    modificadoPor?: number | null;
    modificadoPorNombre?: string | null;
    modificadoPorDni?: string | null;
    fechaModificadoPor?: Date | string | null;

    estadoPor?: number | null;
    estadoPorNombre?: string | null;
    estadoPorDni?: string | null;
    fechaEstadoPor?: Date | string | null;
}
export interface VMAudienciaAsesorResumen {
    id: number;
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreCompleto: string;
}