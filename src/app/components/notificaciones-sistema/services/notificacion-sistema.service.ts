import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '@/app/app.token';
import { ApiMisNotificaciones } from '../models/notificacion-sistema.api';

@Injectable({ providedIn: 'root' })
export class NotificacionSistemaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/notificaciones`;

  getMias(limit = 20): Observable<ApiMisNotificaciones> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<ApiMisNotificaciones>(`${this.base}/mias`, { params });
  }

  marcarTodasLeidas(): Observable<{ actualizadas: number }> {
    return this.http.patch<{ actualizadas: number }>(
      `${this.base}/mias/marcar-leidas`,
      {},
    );
  }

  descartar(id: number): Observable<{ ok: boolean }> {
    return this.http.patch<{ ok: boolean }>(
      `${this.base}/${id}/descartar`,
      {},
    );
  }
}
