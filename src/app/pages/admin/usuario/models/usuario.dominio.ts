// src/app/pages/usuario/models/usuario.dominio.ts

export const ESTADO_USUARIO_OPCIONES = [
  { value: 1, label: 'Activo' },
  { value: 2, label: 'Suspendido' },
  { value: 3, label: 'Por confirmar correo' },
  { value: 4, label: 'Por autorizar' },
  { value: 0, label: 'Eliminado' },
] as const;

export type EstadoUsuario = (typeof ESTADO_USUARIO_OPCIONES)[number]['value'];

export function estadoUsuarioToLabel(v: number | null | undefined): string {
  const hit = ESTADO_USUARIO_OPCIONES.find(o => o.value === v);
  return hit ? hit.label : '—';
}

export function usuarioEstadoBadgeClass(v: number | null | undefined): string {
  switch (v) {
    case 1:
      return 'badge text-bg-success';
    case 2:
      return 'badge text-bg-warning';
    case 3: 
      return 'badge text-bg-info';
    case 4:
      return 'badge text-bg-primary';
    case 0:
      return 'badge text-bg-secondary';
    default:
      return 'badge text-bg-light text-dark';
  }
}