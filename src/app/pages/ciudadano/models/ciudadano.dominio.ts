//Materia
export const CONOCIO_CIUDADANO_OPCIONES = [
  { value: 'AMIGO',        label: 'Amigo' },
  { value: 'VECINO',       label: 'Vecino' },
  { value: 'VOLANTE',      label: 'Volante' },
  { value: 'OTROS',        label: 'Otros' },
] as const;

export type Conocio = typeof CONOCIO_CIUDADANO_OPCIONES[number]['value'] | '';

export function conocioToLabel(v: Conocio | null | undefined): string {
  return CONOCIO_CIUDADANO_OPCIONES.find(o => o.value === v)?.label ?? '—';
}
export function conocioToDB(conocios: Conocio, conocioOtros?: string): string {
  if (conocios && conocios !== 'OTROS') return conocios;                     // catálogo
  const otro = (conocioOtros ?? '').trim();
  return (otro || 'OTROS').toUpperCase().slice(0, 30);                      // único campo co_materia_consulta
}

export function conocioFromDB(ci_conocio: string | null | undefined): {
  conocios: Conocio; conocioOtros: string;
} {
  const raw = (ci_conocio ?? '').trim().toUpperCase();
  if (!raw) return { conocios: '', conocioOtros: '' };
  const hit = CONOCIO_CIUDADANO_OPCIONES.some(o => o.value === raw && raw !== 'OTROS');
  return hit ? { conocios: raw as Conocio, conocioOtros: '' }
             : { conocios: 'OTROS', conocioOtros: raw === 'OTROS' ? '' : raw };
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