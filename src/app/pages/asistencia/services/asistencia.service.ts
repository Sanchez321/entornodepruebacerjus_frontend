import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';
import {
  ApiAsistenciaListaSimple,
  ApiAsistenciaPageSimple,
  ApiMiHorarioHoyResponse,
  ApiPunchResponse,
} from '../models/asistencia.api';
import {
  DTOCorregirSalida,
  DTOCreateMarca,
} from '../models/asistencia.dto';
import {
  VMAsistenciaListaOptions,
  VMAsistenciaListaSimple,
  VMMiHorarioHoy,
  VMPage,
} from '../models/asistencia.vm';
import {
  MapAsistenciaListaItemVM,
  MapAsistenciaListaOpciones,
  MapMiHorarioHoyVM,
  MapPageToVM,
} from '../mappers/asistencia.mapper';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/asistencia`;

  list(
    opts: VMAsistenciaListaOptions,
  ): Observable<VMPage<VMAsistenciaListaSimple>> {
    const params = toHttpParams(MapAsistenciaListaOpciones(opts));

    return this.http
      .get<ApiAsistenciaPageSimple>(this.base, { params })
      .pipe(
        map((page) =>
          MapPageToVM<ApiAsistenciaListaSimple, VMAsistenciaListaSimple>(
            page,
            MapAsistenciaListaItemVM,
          ),
        ),
      );
  }

  getMiHorarioHoy(): Observable<VMMiHorarioHoy> {
    return this.http
      .get<ApiMiHorarioHoyResponse>(`${this.base}/mi-horario-hoy`)
      .pipe(map(MapMiHorarioHoyVM));
  }

  marcarEntrada(payload: DTOCreateMarca = {}): Observable<ApiPunchResponse> {
    return this.http.post<ApiPunchResponse>(`${this.base}/entrada`, payload);
  }

  marcarSalida(payload: DTOCreateMarca = {}): Observable<ApiPunchResponse> {
    return this.http.post<ApiPunchResponse>(`${this.base}/salida`, payload);
  }

  corregirSalida(
    payload: DTOCorregirSalida = {},
  ): Observable<ApiPunchResponse> {
    return this.http.post<ApiPunchResponse>(
      `${this.base}/salida/corregir`,
      payload,
    );
  }
}
