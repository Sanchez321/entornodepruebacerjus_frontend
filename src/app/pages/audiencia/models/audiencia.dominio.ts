// src/app/pages/audiencia/models/audiencia.dominio.ts

export const AUDIENCIA_ESTADO_OPCIONES = [
    { value: 1, label: 'ACTIVO' },
    { value: 0, label: 'ELIMINADO' },
] as const;

export function audienciaEstadoToLabel(v: number | null | undefined): string {
    switch (v) {
        case 1: return 'ACTIVO';
        case 0: return 'ELIMINADO';
        default: return '—';
    }
}

export function audienciaEstadoBadgeClass(v: number | null | undefined): string {
    switch (v) {
        case 1: return 'bg-success';
        case 0: return 'bg-danger';
        default: return 'bg-secondary';
    }
}

export type EstadoAudienciaVisual =
    | 'PROGRAMADA'
    | 'EN_CURSO'
    | 'FINALIZADA'
    | 'CANCELADA';

export function resolverEstadoAudienciaVisual(
    inicio: Date | string | null | undefined,
    fin?: Date | string | null,
    estadoManual?: string | null,
    now: Date = new Date(),
): EstadoAudienciaVisual {
    const manual = (estadoManual ?? '').trim().toUpperCase();

    if (manual === 'CANCELADO' || manual === 'CANCELADA') {
        return 'CANCELADA';
    }

    if (!inicio) return 'PROGRAMADA';

    const start = new Date(inicio);
    if (isNaN(start.getTime())) return 'PROGRAMADA';

    const end = fin
        ? new Date(fin)
        : new Date(start.getTime() + 45 * 60 * 1000);

    if (isNaN(end.getTime())) {
        return now < start ? 'PROGRAMADA' : 'FINALIZADA';
    }

    if (now < start) return 'PROGRAMADA';
    if (now >= start && now <= end) return 'EN_CURSO';

    return 'FINALIZADA';
}

export function estadoAudienciaVisualToLabel(v: EstadoAudienciaVisual): string {
    switch (v) {
        case 'PROGRAMADA': return 'Programada';
        case 'EN_CURSO': return 'En curso';
        case 'FINALIZADA': return 'Finalizada';
        case 'CANCELADA': return 'Cancelada';
    }
}

export function estadoAudienciaVisualBadgeClass(v: EstadoAudienciaVisual): string {
    switch (v) {
        case 'PROGRAMADA': return 'bg-primary';
        case 'EN_CURSO': return 'bg-info';
        case 'FINALIZADA': return 'bg-success';
        case 'CANCELADA': return 'bg-danger';
    }
}