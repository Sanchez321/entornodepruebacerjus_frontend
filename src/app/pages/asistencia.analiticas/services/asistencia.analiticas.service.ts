import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { API_URL } from '@app/app.token';
import {
  ApiAsistenciaDashboardResponse,
  ApiAsistenciaDimUsuario,
  ApiAsistenciaEtlRunResponse,
  ApiAsistenciaEtlStatus,
  ApiAsistenciaPeriodoPageResponse,
  ApiTablaSegmento,
} from '../models/asistencia.analiticas.api';
import {
  VMAsistenciaDashboard,
  VMAsistenciaDimUsuario,
  VMAsistenciaEtlStatus,
  VMAsistenciaPeriodoPage,
  VMAsistenciaQuery,
} from '../models/asistencia.analiticas.vm';
import {
  mapAsistenciaDashboard,
  mapAsistenciaDimUsuarios,
  mapAsistenciaEtlStatus,
  mapAsistenciaPeriodoPage,
} from '../mappers/asistencia.analiticas.mapper';

function toHttpParams(
  obj: Record<string, unknown>,
): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(obj)) {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      continue;
    }

    params = params.set(key, String(value));
  }

  return params;
}

@Injectable({ providedIn: 'root' })
export class AsistenciasDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base =
    `${this.apiUrl}/asistencia-analytics`;

  getDashboard(
    q: VMAsistenciaQuery,
  ): Observable<VMAsistenciaDashboard> {
    return this.http
      .get<ApiAsistenciaDashboardResponse>(
        `${this.base}/dashboard-rango`,
        {
          params: this.queryParams(q),
        },
      )
      .pipe(map(mapAsistenciaDashboard));
  }

  getPeriodoPage(
    q: VMAsistenciaQuery,
    segment: ApiTablaSegmento,
    page: number,
    pageSize: number,
  ): Observable<VMAsistenciaPeriodoPage> {
    const params = this.queryParams(q)
      .set('segment', segment)
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http
      .get<ApiAsistenciaPeriodoPageResponse>(
        `${this.base}/periodo-page`,
        { params },
      )
      .pipe(map(mapAsistenciaPeriodoPage));
  }

  getDimUsuarios():
    Observable<VMAsistenciaDimUsuario[]> {
    return this.http
      .get<ApiAsistenciaDimUsuario[]>(
        `${this.base}/dims/usuarios`,
      )
      .pipe(map(mapAsistenciaDimUsuarios));
  }

  getEtlStatus():
    Observable<VMAsistenciaEtlStatus> {
    return this.http
      .get<ApiAsistenciaEtlStatus>(
        `${this.base}/etl/status`,
      )
      .pipe(map(mapAsistenciaEtlStatus));
  }

  runEtlPreset(
    preset:
      | 'TODAY'
      | 'WEEK_THIS'
      | 'WEEK_LAST'
      | 'MONTH_THIS'
      | 'MONTH_LAST'
      | 'YEAR_THIS'
      | 'YEAR_LAST'
      | 'SMART',
  ): Observable<ApiAsistenciaEtlRunResponse> {
    return this.http.post<ApiAsistenciaEtlRunResponse>(
      `${this.base}/etl/run`,
      {
        preset,
        only: 'all',
      },
    );
  }

  exportar(
    q: VMAsistenciaQuery,
    guardarDrive = false,
  ): Observable<HttpResponse<Blob>> {
    const params = this.queryParams(q)
      .set('formato', 'xlsx')
      .set('guardarDrive', String(guardarDrive));

    return this.http.get(`${this.base}/export`, {
      params,
      observe: 'response',
      responseType: 'blob',
    });
  }

  private queryParams(
    q: VMAsistenciaQuery,
  ): HttpParams {
    return toHttpParams({
      periodoTipo: q.periodoTipo,
      year: q.year,
      month: q.month,
      week: q.week,
      start: q.start,
      end: q.end,
      view: q.view,
      us_id: q.usId ?? undefined,
    });
  }
}
