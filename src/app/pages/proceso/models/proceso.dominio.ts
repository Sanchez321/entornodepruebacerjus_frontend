// src/app/pages/proceso/models/proceso.dominio.ts

export const PROCESO_ESTADO_OPCIONES = [
  { value: 1, label: 'ACTIVO' },
  { value: 0, label: 'ELIMINADO' },
] as const;

export function procesoEstadoToLabel(v: number | null | undefined): string {
  switch (v) {
    case 1: return 'ACTIVO';
    case 0: return 'ELIMINADO';
    default: return '—';
  }
}

export function procesoEstadoBadgeClass(v: number | null | undefined): string {
  switch (v) {
    case 1: return 'bg-success';
    case 0: return 'bg-danger';
    default: return 'bg-secondary';
  }
}

export const REPORTE_FORMATO_OPCIONES = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
] as const;

export const REPORTE_MODO_OPCIONES = [
  { value: 'ASESOR', label: 'Datos para asesores', minLevel: 3 },
  { value: 'ANALITICO', label: 'Datos para gráficas', minLevel: 3 },
  { value: 'AUDITORIA', label: 'Datos auditables', minLevel: 2 },
  { value: 'COMPLETO', label: 'Exportación completa', minLevel: 1 },
] as const;

export const REPORTE_ESTADO_OPCIONES = [
  { value: 'ACTIVOS', label: 'Solo activos', minLevel: 3 },
  { value: 'ELIMINADOS', label: 'Solo eliminados', minLevel: 2 },
  { value: 'TODOS', label: 'Todos', minLevel: 2 },
] as const;

export const REPORTE_MES_OPCIONES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const;

export type ReporteFormato = typeof REPORTE_FORMATO_OPCIONES[number]['value'];
export type ReporteModo = typeof REPORTE_MODO_OPCIONES[number]['value'];
export type ReporteEstado = typeof REPORTE_ESTADO_OPCIONES[number]['value'];

export function reporteModoFuerzaActivos(modo: ReporteModo | string | null | undefined): boolean {
  return modo === 'ASESOR' || modo === 'ANALITICO';
}

export function canSeeReporteOption(
  userLevel: number | null | undefined,
  minLevel: number,
): boolean {
  return userLevel != null && userLevel <= minLevel;
}