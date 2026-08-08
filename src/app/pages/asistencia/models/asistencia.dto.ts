export interface DTOAsistenciaListaOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  ma_as_ID?: number;
}

export interface DTOCreateMarca {
  ma_lat?: number;
  ma_lng?: number;
  ma_accuracy?: number;
  ma_nota?: string;
}

export interface DTOCorregirSalida extends DTOCreateMarca {
  motivo?: string;
}
