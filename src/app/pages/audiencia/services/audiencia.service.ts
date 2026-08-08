// src/app/pages/audiencia/services/audiencia.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, firstValueFrom } from 'rxjs';

import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';

import {ApiAudienciaDetalleSimple,ApiAudienciaListaSimple,ApiAudienciaPageSimple,ApiAudienciaControl,ApiAudienciaCalendarioSemana,
    ApiAudienciaAsesorResumen,} from '../models/audiencia.api';

import {VMPage,VMAudienciaCreate,VMAudienciaDetalleSimple,VMAudienciaListaOptions,VMAudienciaListaSimple,VMAudienciaUpdate,
    VMAudienciaAsesorResumen,VMAudienciaControl,VMAudienciaCalendarioSemana,VMAudienciaCalendarioSemanaOptions,
    } from '../models/audiencia.vm';

import {DTOAudienciaCreate,DTOAudienciaListaOptions,DTOAudienciaUpdate,DTOAudienciaCalendarioSemanaOptions,
    } from '../models/audiencia.dtos';

import {MapPageToVM,MapAudienciaCreate,MapAudienciaDetalleVM,MapAudienciaListaItemVM,MapAudienciaListaOpciones,
    MapAudienciaUpdateParcial,MapAudienciaControl,MapAudienciaCalendarioSemanaVM,MapAudienciaCalendarioSemanaOpciones,
    MapAudienciaAsesorResumen,} from '../mappers/audiencia.mapper';

@Injectable({ providedIn: 'root' })
export class AudienciaService {
    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);
    private readonly base = `${this.apiUrl}/audiencia`;
    private readonly baseUsuario = `${this.apiUrl}/usuario`;

    list(opts: VMAudienciaListaOptions): Observable<VMPage<VMAudienciaListaSimple>> {
        const dto: DTOAudienciaListaOptions = MapAudienciaListaOpciones(opts);
        const params = toHttpParams(dto);

        return this.http
            .get<ApiAudienciaPageSimple>(this.base, { params })
            .pipe(
                map(apiPage =>
                    MapPageToVM<ApiAudienciaListaSimple, VMAudienciaListaSimple>(
                        apiPage,
                        MapAudienciaListaItemVM,
                    ),
                ),
            );
    }

    calendarioSemana(
        opts: VMAudienciaCalendarioSemanaOptions,
    ): Observable<VMAudienciaCalendarioSemana> {
        const dto: DTOAudienciaCalendarioSemanaOptions =
            MapAudienciaCalendarioSemanaOpciones(opts);

        const params = toHttpParams(dto);

        return this.http
            .get<ApiAudienciaCalendarioSemana>(`${this.base}/calendario/semana`, { params })
            .pipe(map(apiItem => MapAudienciaCalendarioSemanaVM(apiItem)));
    }

    async create(vm: VMAudienciaCreate): Promise<number> {
        const dto: DTOAudienciaCreate = MapAudienciaCreate(vm);

        const response = await firstValueFrom(
            this.http.post<{ au_ID: number }>(this.base, dto),
        );

        return response.au_ID;
    }

    getById(id: number): Observable<VMAudienciaDetalleSimple> {
        return this.http
            .get<ApiAudienciaDetalleSimple>(`${this.base}/${id}`)
            .pipe(map(apiItem => MapAudienciaDetalleVM(apiItem)));
    }

    async update(id: number, changes: Partial<VMAudienciaUpdate>): Promise<number> {
        const dto: DTOAudienciaUpdate = MapAudienciaUpdateParcial(id, changes);

        const response = await firstValueFrom(
            this.http.patch<{ au_ID: number }>(`${this.base}/${id}`, dto),
        );

        return response.au_ID;
    }

    getControlById(id: number): Observable<VMAudienciaControl> {
        return this.http
            .get<ApiAudienciaControl>(`${this.base}/${id}/control`)
            .pipe(map(apiItem => MapAudienciaControl(apiItem)));
    }
    getAsesorResumenByDni(dni: string): Observable<VMAudienciaAsesorResumen | null> {
        const value = (dni ?? '').trim();

        return this.http
            .get<ApiAudienciaAsesorResumen | null>(`${this.baseUsuario}/buscar/dni/${value}`)
            .pipe(map(apiItem => apiItem ? MapAudienciaAsesorResumen(apiItem) : null));
    }
}