// src/app/pages/documentos/models/documentos.dominio.ts

export const DOCUMENTO_RUTA_BASE_CODIGO_OPCIONES = [
  { value: 'GENERAL', label: 'Drive principal' },
  { value: 'BACKUP', label: 'Drive de backups' },
] as const;

export type DocumentoRutaBaseCodigo =
  typeof DOCUMENTO_RUTA_BASE_CODIGO_OPCIONES[number]['value'];

export const DOCUMENTO_RUTA_BASE_ESTADO_OPCIONES = [
  { value: 1, label: 'ACTIVO' },
  { value: 0, label: 'ELIMINADO' },
] as const;

export function documentoRutaBaseEstadoToLabel(v: number | null | undefined): string {
  switch (v) {
    case 1: return 'ACTIVO';
    case 0: return 'ELIMINADO';
    default: return '—';
  }
}

export function documentoRutaBaseEstadoBadgeClass(v: number | null | undefined): string {
  switch (v) {
    case 1: return 'bg-success';
    case 0: return 'bg-danger';
    default: return 'bg-secondary';
  }
}

export const DOCUMENTO_TIPO_OPCIONES = [
  { value: 'PROCESO', label: 'Proceso' },
  { value: 'TRAMITE', label: 'Trámite' },
  { value: 'MATERIAL_APOYO', label: 'Material de apoyo' },
  { value: 'REPORTE', label: 'Reporte' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'BACKUP', label: 'Backup' },
] as const;

export type DocumentoEntidadTipo =
  typeof DOCUMENTO_TIPO_OPCIONES[number]['value'];

export const DOCUMENTO_CATEGORIA_PROCESO_OPCIONES = [
  { value: 'DEMANDA', label: 'Demanda' },
  { value: 'ESCRITO', label: 'Escrito' },
  { value: 'RESOLUCION', label: 'Resolución' },
  { value: 'NOTIFICACION', label: 'Notificación' },
  { value: 'PRUEBA', label: 'Prueba' },
  { value: 'ANEXO', label: 'Anexo' },
  { value: 'OTROS', label: 'Otros' },
] as const;

export const DOCUMENTO_CATEGORIA_TRAMITE_OPCIONES = [
  { value: 'SOLICITUD', label: 'Solicitud' },
  { value: 'CARGO', label: 'Cargo' },
  { value: 'EXPEDIENTE', label: 'Expediente' },
  { value: 'RESOLUCION', label: 'Resolución' },
  { value: 'NOTIFICACION', label: 'Notificación' },
  { value: 'CONSTANCIA', label: 'Constancia' },
  { value: 'ANEXO', label: 'Anexo' },
  { value: 'OTROS', label: 'Otros' },
] as const;

export const DOCUMENTO_CATEGORIA_MATERIAL_APOYO_OPCIONES = [
  { value: 'LEGISLACION', label: 'Legislación' },
  { value: 'JURISPRUDENCIA', label: 'Jurisprudencia / precedentes' },
  { value: 'DOCTRINA', label: 'Doctrina' },
  { value: 'GUIAS_ESTUDIO', label: 'Guías de estudio' },
  { value: 'MODELOS_REFERENCIALES', label: 'Modelos referenciales' },
  { value: 'MATERIAL_CLASE', label: 'Material de clase' },
  { value: 'OTROS', label: 'Otros' },
] as const;

export const DOCUMENTO_CATEGORIA_MANUAL_OPCIONES = [
  { value: 'ASESOR', label: 'Manual para asesor' },
  { value: 'SUPERVISOR', label: 'Manual para supervisor' },
  { value: 'ADMINISTRADOR', label: 'Manual para administrador' },
  { value: 'GENERAL', label: 'Manual general' },
  { value: 'OTROS', label: 'Otros' },
] as const;

export const DOCUMENTO_CATEGORIA_REPORTE_OPCIONES = [
  { value: 'ANALITICAS', label: 'Analíticas' },
  { value: 'CIUDADANOS', label: 'Ciudadanos' },
  { value: 'CONSULTAS', label: 'Consultas' },
  { value: 'PROCESOS', label: 'Procesos' },
  { value: 'TRAMITES', label: 'Trámites' },
  { value: 'ASISTENCIA', label: 'Asistencia' },
  { value: 'OTROS', label: 'Otros' },
] as const;

export const DOCUMENTO_CATEGORIA_BACKUP_OPCIONES = [
  { value: 'BASE_DATOS', label: 'Base de datos' },
  { value: 'SISTEMA', label: 'Sistema' },
  { value: 'DOCUMENTOS', label: 'Documentos' },
  { value: 'CONFIGURACION', label: 'Configuración' },
  { value: 'OTROS', label: 'Otros' },
] as const;

export type DocumentoCategoriaProceso =
  typeof DOCUMENTO_CATEGORIA_PROCESO_OPCIONES[number]['value'] | '';

export type DocumentoCategoriaGeneral = string;

export function documentoTipoToLabel(
  v: DocumentoEntidadTipo | string | null | undefined,
): string {
  return DOCUMENTO_TIPO_OPCIONES.find(o => o.value === v)?.label ?? '—';
}

export function documentoCategoriaOpcionesPorTipo(
  tipo: DocumentoEntidadTipo | '' | null | undefined,
): readonly { value: string; label: string }[] {
  switch (tipo) {
    case 'PROCESO':
      return DOCUMENTO_CATEGORIA_PROCESO_OPCIONES;

    case 'TRAMITE':
      return DOCUMENTO_CATEGORIA_TRAMITE_OPCIONES;

    case 'MATERIAL_APOYO':
      return DOCUMENTO_CATEGORIA_MATERIAL_APOYO_OPCIONES;

    case 'MANUAL':
      return DOCUMENTO_CATEGORIA_MANUAL_OPCIONES;

    case 'REPORTE':
      return DOCUMENTO_CATEGORIA_REPORTE_OPCIONES;

    case 'BACKUP':
      return DOCUMENTO_CATEGORIA_BACKUP_OPCIONES;

    default:
      return [];
  }
}

export function documentoTipoRequiereEntidadId(
  tipo: DocumentoEntidadTipo | '' | null | undefined,
): boolean {
  return tipo === 'PROCESO' || tipo === 'TRAMITE';
}

export function documentoEntidadIdLabel(
  tipo: DocumentoEntidadTipo | '' | null | undefined,
): string {
  switch (tipo) {
    case 'PROCESO':
      return 'ID del proceso';

    case 'TRAMITE':
      return 'ID del trámite';

    default:
      return 'ID de entidad';
  }
}

export function documentoEntidadIdPlaceholder(
  tipo: DocumentoEntidadTipo | '' | null | undefined,
): string {
  switch (tipo) {
    case 'PROCESO':
      return 'Ej.: 1';

    case 'TRAMITE':
      return 'Ej.: 1';

    default:
      return '';
  }
}

export function formatBytes(bytes: number | null | undefined): string {
  const value = Number(bytes ?? 0);

  if (!value) return '0 B';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}