// src/app/pages/documentos/models/documentos.dtos.ts

export interface DTODocumentoRutaBaseListaOptions {
  page?: number;
  pageSize?: number;
  q?: string;
  drb_estado?: number;
}

export interface DTODocumentoRutaBaseCreate {
  drb_nombre: string;
  drb_codigo: string;
  drb_drive_folder_url?: string;
  drb_drive_folder_id?: string;
  drb_descripcion?: string;
}

export interface DTODocumentoRutaBaseUpdate {
  drb_nombre?: string;
  drb_codigo?: string;
  drb_drive_folder_url?: string;
  drb_drive_folder_id?: string;
  drb_descripcion?: string;
  drb_estado?: number;
}

import type { ApiDocumentoEntidadTipo } from './documentos.api';

export interface DTODocumentoListaOptions {
  page?: number;
  pageSize?: number;
  sort?: string;

  q?: string;

  doc_ID?: string;
  doc_entidad_tipo?: ApiDocumentoEntidadTipo;
  doc_entidad_id?: number;

  doc_ci_ID?: number;
  doc_ci_DNI?: string;

  doc_categoria?: string;
  doc_nombre_original?: string;
  doc_extension?: string;
  doc_entidad_codigo?: string;
  doc_ruta_base_ID?: number;

  doc_fecha_documento?: string;
  doc_fecha_desde?: string;
  doc_fecha_hasta?: string;

  doc_estado?: number;
}