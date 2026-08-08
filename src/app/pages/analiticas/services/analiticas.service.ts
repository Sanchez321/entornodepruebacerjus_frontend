// src/app/pages/analiticas/services/analiticas.service.ts

import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { API_URL } from '@app/app.token';
import { map, Observable } from 'rxjs';

import {
  VMPeriodQuery,
  VMLineaCiudadanos,
  VMBarrasApiladas,
  VMPastelMaterias,
  VMEtlRunResponse,
  VMDimMateria,
  VMDimCanal,
  VMDimUsuario,
  VMSerieSimple,
  VMKpis,
  VMMateriaOtrosItem,
  VMCiudadanoEdad,
  VMCanalOtrosItem,
} from '../models/analiticas.vm';

import {
  ApiCiudadanoEdadItem,
  ApiEtlStatus,
  ApiKpis,
  ApiMateriaOtrosItem,
  ApiPastelMaterias,
  ApiSerieAtenciones,
  ApiSerieAudiencias,
  ApiSerieCiudadanos,
  ApiSerieProcesos,
  ApiSerieTramites,
  ApiCanalOtrosItem,
} from '../models/analiticas.api';

import {
  mapAtencionesBarras,
  mapCiudadanosEdades,
  mapEtlStatus,
  mapKpis,
  mapLineaCiudadanos,
  mapMateriasOtros,
  mapPastelMaterias,
  mapSerieAudiencias,
  mapSerieProcesos,
  mapSerieTramites,
  mapCanalesOtros,
} from '../mappers/analiticas.mapper';

function toHttpParams<T extends object>(obj: T): HttpParams {
  let p = new HttpParams();

  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === undefined || v === null || v === '') continue;

    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      p = p.set(k, v.join(','));
      continue;
    }

    p = p.set(k, String(v));
  }

  return p;
}

@Injectable({ providedIn: 'root' })
export class AnaliticasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/analytics`;

  lineaCiudadanos(q: VMPeriodQuery): Observable<VMLineaCiudadanos> {
    return this.http
      .get<ApiSerieCiudadanos[]>(`${this.base}/linea-ciudadanos`, {
        params: toHttpParams(q),
      })
      .pipe(map((api) => mapLineaCiudadanos(api, q.view)));
  }

  barrasAtenciones(q: VMPeriodQuery): Observable<VMBarrasApiladas> {
    return this.http
      .get<ApiSerieAtenciones[]>(`${this.base}/barras-atenciones`, {
        params: toHttpParams(q),
      })
      .pipe(map((api) => mapAtencionesBarras(api, q.view)));
  }

  pastelMaterias(q: VMPeriodQuery): Observable<VMPastelMaterias> {
    return this.http
      .get<ApiPastelMaterias | { items: ApiPastelMaterias }>(
        `${this.base}/pastel-materias`,
        { params: toHttpParams(q) },
      )
      .pipe(map((res: any) => mapPastelMaterias(res.items ?? res)));
  }

  kpis(q: VMPeriodQuery): Observable<VMKpis> {
    return this.http
      .get<ApiKpis>(`${this.base}/kpis`, {
        params: toHttpParams(q),
      })
      .pipe(map(mapKpis));
  }

  seriesProcesos(q: VMPeriodQuery): Observable<VMSerieSimple> {
    return this.http
      .get<ApiSerieProcesos[]>(`${this.base}/series/procesos`, {
        params: toHttpParams(q),
      })
      .pipe(map((api) => mapSerieProcesos(api, q.view)));
  }

  seriesTramites(q: VMPeriodQuery): Observable<VMSerieSimple> {
    return this.http
      .get<ApiSerieTramites[]>(`${this.base}/series/tramites`, {
        params: toHttpParams(q),
      })
      .pipe(map((api) => mapSerieTramites(api, q.view)));
  }

  seriesAudiencias(q: VMPeriodQuery): Observable<VMSerieSimple> {
    return this.http
      .get<ApiSerieAudiencias[]>(`${this.base}/series/audiencias`, {
        params: toHttpParams(q),
      })
      .pipe(map((api) => mapSerieAudiencias(api, q.view)));
  }

  materiasOtros(q: VMPeriodQuery): Observable<VMMateriaOtrosItem[]> {
    return this.http
      .get<ApiMateriaOtrosItem[]>(`${this.base}/materias/otros`, {
        params: toHttpParams(q),
      })
      .pipe(map(mapMateriasOtros));
  }

  canalesOtros(q: VMPeriodQuery): Observable<VMCanalOtrosItem[]> {
    return this.http
      .get<ApiCanalOtrosItem[]>(`${this.base}/canales/otros`, {
        params: toHttpParams(q),
      })
      .pipe(map(mapCanalesOtros));
  }

  ciudadanosEdades(q: VMPeriodQuery): Observable<VMCiudadanoEdad[]> {
    return this.http
      .get<ApiCiudadanoEdadItem[]>(`${this.base}/ciudadanos/edades`, {
        params: toHttpParams(q),
      })
      .pipe(map(mapCiudadanosEdades));
  }

  exportar(
    q: VMPeriodQuery,
    guardarDrive = false,
  ): Observable<HttpResponse<Blob>> {
    const params = toHttpParams({
      ...q,
      dataset: 'todo',
      formato: 'xlsx',
      guardarDrive,
    });

    return this.http.get(`${this.base}/export`, {
      params,
      observe: 'response',
      responseType: 'blob',
    });
  }

  runEtlRange(body: {
    start?: string;
    end?: string;
    year?: number;
    month?: number;
    only?: 'all' | 'facts' | 'summaries';
  }) {
    return this.http.post<VMEtlRunResponse>(`${this.base}/etl`, body);
  }

  runEtlPreset(
    preset: string,
    only: 'all' | 'facts' | 'summaries' = 'all',
  ) {
    return this.http.post<VMEtlRunResponse>(`${this.base}/etl/run`, {
      preset,
      only,
    });
  }

  getEtlStatus() {
    return this.http
      .get<ApiEtlStatus>(`${this.base}/etl/status`)
      .pipe(map(mapEtlStatus));
  }

  getDimMaterias() {
    return this.http.get<VMDimMateria[]>(`${this.base}/dims/materias`);
  }

  getDimCanales() {
    return this.http.get<VMDimCanal[]>(`${this.base}/dims/canales`);
  }

  getDimUsuarios() {
    return this.http.get<VMDimUsuario[]>(`${this.base}/dims/usuarios`);
  }
}
