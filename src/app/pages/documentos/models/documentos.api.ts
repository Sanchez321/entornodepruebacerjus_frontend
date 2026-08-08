// src/app/pages/documentos/models/documentos.api.ts

export interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiDocumentoRutaBaseListaItem {
  drb_ID: number;
  drb_nombre: string;
  drb_codigo: string;
  drb_drive_folder_id: string;
  drb_drive_folder_url?: string | null;
  drb_descripcion?: string | null;
  drb_estado: number;

  drb_creado_por: number;
  drb_creado_por_nombre?: string | null;
  drb_fecha_creado_por: Date | string;
}

export interface ApiDocumentoRutaBaseDetalle extends ApiDocumentoRutaBaseListaItem {
  drb_modificado_por?: number | null;
  drb_modificado_por_nombre?: string | null;
  drb_fecha_modificado_por?: Date | string | null;

  drb_estado_por?: number | null;
  drb_estado_por_nombre?: string | null;
  drb_fecha_estado_por?: Date | string | null;
}

export type ApiDocumentoRutaBasePage = ApiPage<ApiDocumentoRutaBaseListaItem>;

export type ApiDocumentoEntidadTipo =
  | 'PROCESO'
  | 'TRAMITE'
  | 'MATERIAL_APOYO'
  | 'BACKUP'
  | 'REPORTE'
  | 'MANUAL';

export interface ApiDocumentoListaItem {
  doc_ID: number;

  doc_entidad_tipo: ApiDocumentoEntidadTipo;
  doc_entidad_id?: number | null;

  doc_ci_ID?: number | null;
  doc_ci_DNI?: string | null;

  doc_ruta_base_ID?: number | null;
  doc_ruta_base_nombre?: string | null;
  doc_ruta_base_codigo?: string | null;

  doc_entidad_codigo?: string | null;
  doc_entidad_label?: string | null;

  doc_categoria?: string | null;
  doc_descripcion?: string | null;
  doc_fecha_documento?: Date | string | null;

  doc_nombre_original: string;
  doc_nombre_guardado: string;
  doc_mime_type: string;
  doc_extension: string;
  doc_size_bytes: number;

  doc_storage_provider: string;
  doc_drive_file_id: string;
  doc_drive_folder_id?: string | null;
  doc_drive_web_view_link?: string | null;

  doc_ruta_logica: string;
  doc_estado: number;

  doc_creado_por: number;
  doc_creado_por_nombre?: string | null;
  doc_fecha_creado_por: Date | string;
}

export interface ApiDocumentoPage {
  items: ApiDocumentoListaItem[];
  total: number;
  page: number;
  pageSize: number;
}