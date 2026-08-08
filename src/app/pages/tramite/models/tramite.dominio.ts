// src/app/pages/tramite/models/tramite.dominio.ts

export const ESTADO_TRAMITE_OPCIONES = [
    { value: 'INICIADO', label: 'Iniciado' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'CONCLUIDO', label: 'Concluido' },
    { value: 'SUSPENDIDO', label: 'Suspendido' },
    { value: 'DENEGADO', label: 'Denegado' },
] as const;

export type EstadoTramite = typeof ESTADO_TRAMITE_OPCIONES[number]['value'];

export function estadoTramiteToLabel(v: EstadoTramite | null | undefined): string {
    return ESTADO_TRAMITE_OPCIONES.find(o => o.value === v)?.label ?? '—';
}

export function estadoTramiteBadgeClass(v: EstadoTramite | null | undefined): string {
    switch (v) {
        case 'INICIADO': return 'bg-primary';
        case 'EN_PROCESO': return 'bg-info';
        case 'CONCLUIDO': return 'bg-success';
        case 'SUSPENDIDO': return 'bg-warning text-dark';
        case 'DENEGADO': return 'bg-danger';
        default: return 'bg-secondary';
    }
}