// src/app/pages/analiticas/mappers/analiticas.mapper.ts
import {ApiCiudadanoEdadItem,ApiEtlStatus,ApiKpis,ApiMateriaOtrosItem,ApiPastelMaterias,ApiSerieAtenciones,ApiSerieAudiencias,
  ApiSerieCiudadanos,ApiSerieProcesos,ApiSerieTramites,ApiCanalOtrosItem} from '../models/analiticas.api';

import {PeriodView,VMBarrasApiladas,VMCiudadanoEdad,VMEtlStatus,VMKpis,VMLineaCiudadanos,VMMateriaOtrosItem,VMPastelMaterias,
  VMSerieSimple,VMCanalOtrosItem} from '../models/analiticas.vm';

/* =========================
   Fechas calendario
   ========================= */

const ANALYTICS_TZ = 'America/Lima';

function calendarYmd(value: string | Date | null | undefined): string | null {
  if (value == null) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function calendarParts(
  value: string | Date | null | undefined,
): { year: number; month: number; day: number } | null {
  const ymd = calendarYmd(value);
  if (!ymd) return null;

  const [year, month, day] = ymd.split('-').map(Number);

  if (![year, month, day].every(Number.isFinite)) return null;

  return { year, month, day };
}

function calendarDateUtc(value: string | Date | null | undefined): Date | null {
  const parts = calendarParts(value);
  if (!parts) return null;

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatCalendar(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = calendarDateUtc(value);
  if (!d) return '—';

  return new Intl.DateTimeFormat('es-PE', {
    ...options,
    timeZone: 'UTC',
  }).format(d);
}

function labelByView(value: string | Date, view?: PeriodView): string {
  switch (view ?? 'day') {
    case 'week':
      return `sem ${formatCalendar(value, {
        day: '2-digit',
        month: 'short',
      })}`;

    case 'month':
      return formatCalendar(value, {
        month: 'short',
        year: 'numeric',
      });

    case 'year': {
      const parts = calendarParts(value);
      return parts ? String(parts.year) : '—';
    }

    case 'day':
    default:
      return formatCalendar(value, {
        day: '2-digit',
        month: 'short',
      });
  }
}

function todayLimaParts(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ANALYTICS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
  };
}

function instantIso(value: unknown): string | null {
  if (value == null) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    return raw || null;
  }

  const d = new Date(value as any);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function edadEnAnios(fechaNacimiento?: string | null): number | null {
  const nacimiento = calendarParts(fechaNacimiento);
  if (!nacimiento) return null;

  const hoy = todayLimaParts();
  let edad = hoy.year - nacimiento.year;

  const monthDiff = hoy.month - nacimiento.month;
  const dayDiff = hoy.day - nacimiento.day;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    edad--;
  }

  return edad >= 0 ? edad : null;
}

function rangoEdad(edad: number | null): string | null {
  if (edad == null) return null;
  if (edad < 18) return 'MENOR DE 18';
  if (edad <= 29) return '18-29';
  if (edad <= 39) return '30-39';
  if (edad <= 49) return '40-49';
  if (edad <= 59) return '50-59';

  return '60+';
}

/* =========================
   Series
   ========================= */

export function mapLineaCiudadanos(
  api: ApiSerieCiudadanos[],
  view?: PeriodView,
): VMLineaCiudadanos {
  const categories: string[] = [];
  const nuevos: number[] = [];
  const acumulado: number[] = [];

  for (const r of api ?? []) {
    categories.push(labelByView(r.periodo, view));
    nuevos.push(Number(r.nuevos ?? 0));
    acumulado.push(Number(r.acumulado ?? 0));
  }

  return {
    categories,
    nuevos,
    acumulado,
  };
}

export function mapAtencionesBarras(
  api: ApiSerieAtenciones[],
  view?: PeriodView,
): VMBarrasApiladas {
  const categories: string[] = [];
  const consultas: number[] = [];
  const seguimientos: number[] = [];

  for (const r of api ?? []) {
    categories.push(labelByView(r.periodo, view));
    consultas.push(Number(r.consultas ?? 0));
    seguimientos.push(Number(r.seguimientos ?? 0));
  }

  return {
    categories,
    series: [
      { name: 'Consultas', data: consultas },
      { name: 'Seguimientos', data: seguimientos },
    ],
  };
}

export function mapPastelMaterias(api: ApiPastelMaterias): VMPastelMaterias {
  const labels: string[] = [];
  const series: number[] = [];

  for (const r of api ?? []) {
    const label = (
      r.materia_nombre ??
      r.materia ??
      (r.materia_id != null ? String(r.materia_id) : '—')
    ).toString();

    labels.push(label);
    series.push(Number(r.cantidad ?? 0));
  }

  return {
    labels,
    series,
  };
}

export function mapSerieProcesos(
  api: ApiSerieProcesos[],
  view?: PeriodView,
): VMSerieSimple {
  return mapSerieSimple(api, 'procesos', 'Procesos', view);
}

export function mapSerieTramites(
  api: ApiSerieTramites[],
  view?: PeriodView,
): VMSerieSimple {
  return mapSerieSimple(api, 'tramites', 'Trámites', view);
}

export function mapSerieAudiencias(
  api: ApiSerieAudiencias[],
  view?: PeriodView,
): VMSerieSimple {
  return mapSerieSimple(api, 'audiencias', 'Audiencias', view);
}

function mapSerieSimple<T extends { periodo: string }>(
  api: T[],
  field: keyof T,
  name: string,
  view?: PeriodView,
): VMSerieSimple {
  const categories: string[] = [];
  const data: number[] = [];

  for (const r of api ?? []) {
    categories.push(labelByView(r.periodo, view));
    data.push(Number(r[field] ?? 0));
  }

  return {
    categories,
    series: [
      {
        name,
        data,
      },
    ],
  };
}

/* =========================
   KPIs / tablas
   ========================= */

export function mapKpis(api: ApiKpis): VMKpis {
  return {
    nuevos_ciudadanos: api?.nuevos_ciudadanos ?? 0,
    consultas: api?.consultas ?? 0,
    seguimientos: api?.seguimientos ?? 0,
    atenciones: api?.atenciones ?? 0,
    procesos: api?.procesos ?? 0,
    tramites: api?.tramites ?? 0,
    audiencias: api?.audiencias ?? 0,
    promedio_consultas_por_ciudadano:
      api?.promedio_consultas_por_ciudadano ?? 0,
    seguimientos_por_consulta: api?.seguimientos_por_consulta ?? 0,
  };
}

export function mapMateriasOtros(
  api: ApiMateriaOtrosItem[],
): VMMateriaOtrosItem[] {
  return (api ?? []).map((x) => ({
    materia: x.materia,
    cantidad: Number(x.cantidad ?? 0),
  }));
}

export function mapCanalesOtros(
  api: ApiCanalOtrosItem[],
): VMCanalOtrosItem[] {
  return (api ?? []).map((x) => ({
    canal: x.canal,
    cantidad: Number(x.cantidad ?? 0),
  }));
}

export function mapCiudadanosEdades(
  api: ApiCiudadanoEdadItem[],
): VMCiudadanoEdad[] {
  return (api ?? []).map((x) => {
    const fechaNacimiento = calendarYmd(x.fecha_nacimiento);
    const fechaAlta = calendarYmd(x.fecha_alta);
    const edad = edadEnAnios(fechaNacimiento);

    return {
      fecha_alta: fechaAlta,
      ci_id: x.ci_id,
      ci_dni: x.ci_dni ?? null,
      ciudadano: x.ciudadano ?? null,
      fecha_nacimiento: fechaNacimiento,
      edad,
      rango_edad: rangoEdad(edad),
      canal: x.canal ?? null,
      registrado_por_id: x.registrado_por_id ?? null,
      registrado_por: x.registrado_por ?? null,
    };
  });
}

/* =========================
   ETL Status
   ========================= */

export function mapEtlStatus(api: ApiEtlStatus): VMEtlStatus {
  const running = !!api.isRunning;
  const runObj = api.running ?? null;

  const runId = runObj?.id ?? null;
  const runningSince = instantIso(runObj?.started_at) ?? null;
  const runningPreset = (runObj?.preset ?? null) as string | null;

  const lastRunAt =
    instantIso(api.lastSuccessAt) ??
    instantIso(runObj?.finished_at) ??
    null;

  const lastStart =
    calendarYmd(api.lastSuccessStart) ??
    calendarYmd(runObj?.start_date) ??
    null;

  const lastEnd =
    calendarYmd(api.lastSuccessEnd) ??
    calendarYmd(runObj?.end_date) ??
    null;

  return {
    running,
    runId,
    runningSince,
    runningPreset,
    lastRunAt,
    lastStart,
    lastEnd,
  };
}
