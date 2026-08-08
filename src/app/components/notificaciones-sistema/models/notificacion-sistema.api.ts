export interface ApiNotificacionSistemaItem {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_evento: string | null;
  creado_en: string;
  leida: boolean;
  datos: unknown;
}

export interface ApiMisNotificaciones {
  no_leidas: number;
  items: ApiNotificacionSistemaItem[];
}
