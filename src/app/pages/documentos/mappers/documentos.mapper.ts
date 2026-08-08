// src/app/pages/documentos/mappers/documentos.mapper.ts

import {ApiDocumentoRutaBaseDetalle,ApiDocumentoRutaBaseListaItem,ApiDocumentoListaItem} from '../models/documentos.api';
import {VMDocumentoRutaBaseCreate,VMDocumentoRutaBaseDetalle,VMDocumentoRutaBaseListaOptions,VMDocumentoRutaBaseListaSimple,
    VMDocumentoRutaBaseUpdate,VMPage,VMDocumentoListaOptions,VMDocumentoListaSimple,VMDocumentoSubir,} from '../models/documentos.vm';
import {DTODocumentoRutaBaseCreate,DTODocumentoRutaBaseListaOptions,DTODocumentoRutaBaseUpdate,DTODocumentoListaOptions
    } from '../models/documentos.dtos';
import {documentoRutaBaseEstadoBadgeClass,documentoRutaBaseEstadoToLabel,documentoTipoToLabel,formatBytes,
    } from '../models/documentos.dominio';

export function MapPageToVM<TIn, TOut>(
  api: { items?: TIn[]; total?: number; page?: number; pageSize?: number },
  mapItem: (x: TIn) => TOut,
): VMPage<TOut> {
  const items = (api.items ?? []).map(mapItem);

  return {
    items,
    total: api.total ?? items.length,
    page: api.page ?? 1,
    pageSize: api.pageSize ?? items.length | 0,
  };
}

export function MapDocumentoRutaBaseListaItemVM(
  a: ApiDocumentoRutaBaseListaItem,
): VMDocumentoRutaBaseListaSimple {
  return {
    id: a.drb_ID,
    nombre: a.drb_nombre,
    codigo: a.drb_codigo,
    driveFolderId: a.drb_drive_folder_id,
    driveFolderUrl: a.drb_drive_folder_url ?? null,
    driveUrl: a.drb_drive_folder_url || `https://drive.google.com/drive/folders/${a.drb_drive_folder_id}`,
    descripcion: a.drb_descripcion ?? null,
    estado: a.drb_estado,
    estadoTexto: documentoRutaBaseEstadoToLabel(a.drb_estado),
    estadoBadgeClass: documentoRutaBaseEstadoBadgeClass(a.drb_estado),

    creadoPor: a.drb_creado_por,
    creadoPorNombre: a.drb_creado_por_nombre ?? null,
    fechaCreadoPor: a.drb_fecha_creado_por,
  };
}

export function MapDocumentoRutaBaseDetalleVM(
  a: ApiDocumentoRutaBaseDetalle,
): VMDocumentoRutaBaseDetalle {
  return {
    ...MapDocumentoRutaBaseListaItemVM(a),

    modificadoPor: a.drb_modificado_por ?? null,
    modificadoPorNombre: a.drb_modificado_por_nombre ?? null,
    fechaModificadoPor: a.drb_fecha_modificado_por ?? null,

    estadoPor: a.drb_estado_por ?? null,
    estadoPorNombre: a.drb_estado_por_nombre ?? null,
    fechaEstadoPor: a.drb_fecha_estado_por ?? null,
  };
}

export function MapDocumentoRutaBaseListaOpciones(
  vm: VMDocumentoRutaBaseListaOptions,
): DTODocumentoRutaBaseListaOptions {
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    q: trim(vm.q),
    drb_estado: vm.estado ?? undefined,
  };
}

export function MapDocumentoRutaBaseCreate(
  vm: VMDocumentoRutaBaseCreate,
): DTODocumentoRutaBaseCreate {
  return {
    drb_nombre: requiredUpper(vm.nombre),
    drb_codigo: requiredUpper(vm.codigo),
    drb_drive_folder_url: requiredTrim(vm.driveFolderUrl),
    drb_descripcion: optionalUpper(vm.descripcion),
  };
}

export function MapDocumentoRutaBaseUpdate(
  vm: Partial<VMDocumentoRutaBaseUpdate>,
): DTODocumentoRutaBaseUpdate {
  const dto: DTODocumentoRutaBaseUpdate = {};

  if (vm.nombre !== undefined) dto.drb_nombre = requiredUpper(vm.nombre);
  if (vm.codigo !== undefined) dto.drb_codigo = requiredUpper(vm.codigo);
  if (vm.driveFolderUrl !== undefined) dto.drb_drive_folder_url = requiredTrim(vm.driveFolderUrl);
  if (vm.descripcion !== undefined) dto.drb_descripcion = optionalUpper(vm.descripcion);
  if (vm.estado !== undefined) dto.drb_estado = vm.estado;

  return dto;
}

function trim(s?: string | null): string | undefined {
  const v = (s ?? '').trim();
  return v || undefined;
}

function requiredTrim(s?: string | null): string {
  const v = (s ?? '').trim();

  if (!v) {
    throw new Error('Hay campos obligatorios vacíos.');
  }

  return v;
}

function requiredUpper(s?: string | null): string {
  return requiredTrim(s).toUpperCase();
}

function optionalUpper(s?: string | null): string | undefined {
  const v = (s ?? '').trim();
  return v ? v.toUpperCase() : undefined;
}

export function MapDocumentoListaItemVM(a: ApiDocumentoListaItem): VMDocumentoListaSimple {
  return {
    id: a.doc_ID,

    entidadTipo: a.doc_entidad_tipo,
    entidadTipoTexto: documentoTipoToLabel(a.doc_entidad_tipo),
    entidadId: a.doc_entidad_id ?? null,

    ciudadanoId: a.doc_ci_ID ?? null,
    ciudadanoDni: a.doc_ci_DNI ?? null,

    rutaBaseId: a.doc_ruta_base_ID ?? null,
    rutaBaseNombre: a.doc_ruta_base_nombre ?? null,
    rutaBaseCodigo: a.doc_ruta_base_codigo ?? null,

    entidadCodigo: a.doc_entidad_codigo ?? null,
    entidadLabel: a.doc_entidad_label ?? null,

    categoria: a.doc_categoria ?? null,
    descripcion: a.doc_descripcion ?? null,
    fechaDocumento: a.doc_fecha_documento
      ? String(a.doc_fecha_documento).slice(0, 10)
      : null,
    fechaDocumentoFormato: a.doc_fecha_documento
      ? String(a.doc_fecha_documento).slice(0, 10)
      : '—',

    nombreOriginal: a.doc_nombre_original,
    nombreGuardado: a.doc_nombre_guardado,
    mimeType: a.doc_mime_type,
    extension: a.doc_extension,
    sizeBytes: a.doc_size_bytes,
    sizeTexto: formatBytes(a.doc_size_bytes),

    storageProvider: a.doc_storage_provider,
    driveFileId: a.doc_drive_file_id,
    driveFolderId: a.doc_drive_folder_id ?? null,
    driveWebViewLink: a.doc_drive_web_view_link ?? null,

    rutaLogica: a.doc_ruta_logica,
    estado: a.doc_estado,

    creadoPor: a.doc_creado_por,
    creadoPorNombre: a.doc_creado_por_nombre ?? null,
    fechaCreadoPor: a.doc_fecha_creado_por,
  };
}

export function MapDocumentoListaOpciones(vm: VMDocumentoListaOptions,): DTODocumentoListaOptions {
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    sort: vm.sort,

    q: trim(vm.q),

    doc_ID: vm.id != null ? String(vm.id) : undefined,

    doc_entidad_tipo: vm.entidadTipo,
    doc_entidad_id: vm.entidadId,

    doc_ci_ID: vm.ciudadanoId,
    doc_ci_DNI: trim(vm.ciudadanoDni),

    doc_categoria: trim(vm.categoria),
    doc_nombre_original: trim(vm.nombreOriginal),
    doc_extension: trim(vm.extension),
    doc_entidad_codigo: trim(vm.entidadCodigo),
    doc_ruta_base_ID: vm.rutaBaseId,

    doc_fecha_documento: trim(vm.fechaDocumento),
    doc_fecha_desde: trim(vm.fechaDesde),
    doc_fecha_hasta: trim(vm.fechaHasta),

    doc_estado: vm.estado,
  };
}

export function MapDocumentoSubirFormData(vm: VMDocumentoSubir): FormData {
  const fd = new FormData();

  fd.append('file', vm.file);
  fd.append('doc_entidad_tipo', vm.entidadTipo);

  if (vm.entidadId != null) {
    fd.append('doc_entidad_id', String(vm.entidadId));
  }

  if (vm.rutaBaseId != null) {
    fd.append('doc_ruta_base_ID', String(vm.rutaBaseId));
  }

  if (vm.categoria?.trim()) {
    fd.append('doc_categoria', vm.categoria.trim());
  }

  if (vm.descripcion?.trim()) {
    fd.append('doc_descripcion', vm.descripcion.trim());
  }

  if (vm.fechaDocumento?.trim()) {
    fd.append('doc_fecha_documento', vm.fechaDocumento.trim());
  }

  return fd;
}