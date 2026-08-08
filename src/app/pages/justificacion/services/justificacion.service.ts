import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';
import {
  ApiAsistenciaJustificacionItem,
  ApiAsistenciaJustificacionResumen,
  ApiPage,
} from '../models/justificacion.api';
import {
  DTOAsistenciaJustificacionCreate,
  DTOAsistenciaJustificacionDecision,
  DTOAsistenciaJustificacionListaOptions,
} from '../models/justificacion.dtos';
import {
  VMAsistenciaJustificacionCreate,
  VMAsistenciaJustificacionItem,
  VMAsistenciaJustificacionListaOptions,
  VMAsistenciaJustificacionResumen,
  VMPage,
} from '../models/justificacion.vm';
import {
  MapJustificacionCreate,
  MapJustificacionItemVM,
  MapJustificacionListaOpciones,
  MapJustificacionResumenVM,
  MapPageToVM,
} from '../mappers/justificacion.mapper';

@Injectable({ providedIn: 'root' })
export class JustificacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/asistencia-justificaciones`;

  async create(vm: VMAsistenciaJustificacionCreate): Promise<number> {
    const dto: DTOAsistenciaJustificacionCreate = MapJustificacionCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ aj_ID: number }>(this.base, dto),
    );
    return response.aj_ID;
  }

  listMis(
    opts: VMAsistenciaJustificacionListaOptions,
  ): Observable<VMPage<VMAsistenciaJustificacionItem>> {
    const params = toHttpParams(MapJustificacionListaOpciones(opts));
    return this.http
      .get<ApiPage<ApiAsistenciaJustificacionItem>>(`${this.base}/mis`, {
        params,
      })
      .pipe(map((page) => MapPageToVM(page, MapJustificacionItemVM)));
  }

  getMisResumen(
    opts: VMAsistenciaJustificacionListaOptions,
  ): Observable<VMAsistenciaJustificacionResumen> {
    const params = toHttpParams(MapJustificacionListaOpciones(opts));
    return this.http
      .get<ApiAsistenciaJustificacionResumen>(`${this.base}/mis/resumen`, {
        params,
      })
      .pipe(map(MapJustificacionResumenVM));
  }

  listPendientes(
    opts: VMAsistenciaJustificacionListaOptions,
  ): Observable<VMPage<VMAsistenciaJustificacionItem>> {
    const params = toHttpParams(MapJustificacionListaOpciones(opts));
    return this.http
      .get<ApiPage<ApiAsistenciaJustificacionItem>>(`${this.base}/pendientes`, {
        params,
      })
      .pipe(map((page) => MapPageToVM(page, MapJustificacionItemVM)));
  }

  getResumen(
    opts: VMAsistenciaJustificacionListaOptions,
  ): Observable<VMAsistenciaJustificacionResumen> {
    const params = toHttpParams(MapJustificacionListaOpciones(opts));
    return this.http
      .get<ApiAsistenciaJustificacionResumen>(`${this.base}/resumen`, {
        params,
      })
      .pipe(map(MapJustificacionResumenVM));
  }

  aprobar(id: number, decisionMotivo: string) {
    const dto: DTOAsistenciaJustificacionDecision = {
      decision_motivo: decisionMotivo.trim(),
    };
    return firstValueFrom(
      this.http.patch<{ aj_ID: number }>(`${this.base}/${id}/aprobar`, dto),
    );
  }

  rechazar(id: number, decisionMotivo: string) {
    const dto: DTOAsistenciaJustificacionDecision = {
      decision_motivo: decisionMotivo.trim(),
    };
    return firstValueFrom(
      this.http.patch<{ aj_ID: number }>(`${this.base}/${id}/rechazar`, dto),
    );
  }
}
