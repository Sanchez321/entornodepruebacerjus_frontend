// Lleva caso con nosotros
export type LlevaCasoConNosotros = 'SI' | 'NO' | 'POR_CONFIRMAR';

export const LLEVA_CASO_OPCIONES: ReadonlyArray<{ value: LlevaCasoConNosotros; label: string }> = [
  { value: 'SI', label: 'SÍ' },
  { value: 'NO', label: 'NO' },
  { value: 'POR_CONFIRMAR', label: 'POR CONFIRMAR' },
];

export function llevaCasoToLabel(v: string | null | undefined): string {
  switch (v) {
    case 'SI': return 'SÍ';
    case 'NO': return 'NO';
    case 'POR_CONFIRMAR': return 'POR CONFIRMAR';
    default: return '—';
  }
}

// Materia
export const MATERIA_CONSULTA_OPCIONES = [
  { value: 'DERECHO CIVIL',          label: 'Derecho Civil' },
  { value: 'DERECHO FAMILIAR',       label: 'Derecho Familiar' },
  { value: 'DERECHO LABORAL',        label: 'Derecho Laboral' },
  { value: 'DERECHO PENAL',          label: 'Derecho Penal' },
  { value: 'DERECHO CONSTITUCIONAL', label: 'Derecho Constitucional' },
  { value: 'DERECHO SUCESORIO',      label: 'Derecho Sucesorio' },
  { value: 'OTROS',                  label: 'Otros' },
] as const;

export type Materia = typeof MATERIA_CONSULTA_OPCIONES[number]['value'] | '';

export function materiaToLabel(v: Materia | null | undefined): string {
  return MATERIA_CONSULTA_OPCIONES.find(o => o.value === v)?.label ?? '—';
}

export function materiaToDB(materias: Materia, materiaOtros?: string): string {
  if (materias && materias !== 'OTROS') return materias;

  const otro = (materiaOtros ?? '').trim();
  return (otro || 'OTROS').toUpperCase().slice(0, 150);
}

export function materiaFromDB(co_materia_consulta: string | null | undefined): {
  materias: Materia;
  materiaOtros: string;
} {
  const raw = (co_materia_consulta ?? '').trim().toUpperCase();

  if (!raw) return { materias: '', materiaOtros: '' };

  const hit = MATERIA_CONSULTA_OPCIONES.some(o => o.value === raw && raw !== 'OTROS');

  return hit
    ? { materias: raw as Materia, materiaOtros: '' }
    : { materias: 'OTROS', materiaOtros: raw === 'OTROS' ? '' : raw };
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