// src/app/pages/documentos/models/documentos.vm.ts

import type { DocumentoRutaBaseCodigo,DocumentoCategoriaProceso,DocumentoEntidadTipo, } from './documentos.dominio';

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VMDocumentoRutaBaseListaSimple {
  id: number;
  nombre: string;
  codigo: string;
  driveFolderId: string;
  driveFolderUrl?: string | null;
  driveUrl: string;
  descripcion?: string | null;
  estado: number;
  estadoTexto: string;
  estadoBadgeClass: string;

  creadoPor: number;
  creadoPorNombre?: string | null;
  fechaCreadoPor: Date | string;
}

export interface VMDocumentoRutaBaseDetalle extends VMDocumentoRutaBaseListaSimple {
  modificadoPor?: number | null;
  modificadoPorNombre?: string | null;
  fechaModificadoPor?: Date | string | null;

  estadoPor?: number | null;
  estadoPorNombre?: string | null;
  fechaEstadoPor?: Date | string | null;
}

export interface VMDocumentoRutaBaseListaOptions {
  page?: number;
  pageSize?: number;
  q?: string;
  estado?: number;
}

export interface VMDocumentoRutaBaseCreate {
  nombre: string;
  codigo: DocumentoRutaBaseCodigo;
  driveFolderUrl: string;
  descripcion?: string;
}

export interface VMDocumentoRutaBaseUpdate {
  nombre?: string;
  codigo?: DocumentoRutaBaseCodigo;
  driveFolderUrl?: string;
  descripcion?: string;
  estado?: number;
}

export interface VMDocumentoListaSimple {
  id: number;

  entidadTipo: DocumentoEntidadTipo;
  entidadTipoTexto: string;
  entidadId?: number | null;

  ciudadanoId?: number | null;
  ciudadanoDni?: string | null;

  rutaBaseId?: number | null;
  rutaBaseNombre?: string | null;
  rutaBaseCodigo?: string | null;

  entidadCodigo?: string | null;
  entidadLabel?: string | null;

  categoria?: string | null;
  descripcion?: string | null;
  fechaDocumento?: string | null;
  fechaDocumentoFormato: string;

  nombreOriginal: string;
  nombreGuardado: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  sizeTexto: string;

  storageProvider: string;
  driveFileId: string;
  driveFolderId?: string | null;
  driveWebViewLink?: string | null;

  rutaLogica: string;
  estado: number;

  creadoPor: number;
  creadoPorNombre?: string | null;
  fechaCreadoPor: Date | string;
}

export interface VMDocumentoListaOptions {
  page?: number;
  pageSize?: number;
  sort?: string;

  q?: string;
  id?: number;

  entidadTipo?: DocumentoEntidadTipo;
  entidadId?: number;

  ciudadanoId?: number;
  ciudadanoDni?: string;

  categoria?: string;
  nombreOriginal?: string;
  extension?: string;
  entidadCodigo?: string;
  rutaBaseId?: number;

  fechaDocumento?: string;
  fechaDesde?: string;
  fechaHasta?: string;

  estado?: number;
}

export interface VMDocumentoSubir {
  file: File;

  entidadTipo: DocumentoEntidadTipo;
  entidadId?: number;

  rutaBaseId?: number;

  categoria?: string;
  descripcion?: string;
  fechaDocumento?: string;
}

export interface VMDocumentoProcesoSubirForm {
  rutaBaseId: number | null;
  categoria: DocumentoCategoriaProceso;
  categoriaOtros: string;
  descripcion: string;
  fechaDocumento: string;
}