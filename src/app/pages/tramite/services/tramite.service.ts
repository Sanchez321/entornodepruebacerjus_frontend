// src/app/pages/tramite/services/tramite.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, firstValueFrom } from 'rxjs';
import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';
import {ApiTramiteDetalleSimple,ApiTramiteListaSimple,ApiTramitePageSimple,ApiTramiteControl,
    } from '../models/tramite.api';
import {VMPage,VMTramiteCreate,VMTramiteDetalleSimple,VMTramiteListaOptions,VMTramiteListaSimple,VMTramiteUpdate,VMTramiteControl,
    } from '../models/tramite.vm';
import {DTOTramiteCreate,DTOTramiteListaOptions,DTOTramiteUpdate,} from '../models/tramite.dtos';
import {MapPageToVM,MapTramiteCreate,MapTramiteDetalleVM,MapTramiteListaItemVM,MapTramiteListaOpciones,MapTramiteUpdateParcial,
  MapTramiteControl,} from '../mappers/tramite.mapper';

@Injectable({ providedIn: 'root' })
export class TramiteService {
    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);
    private readonly base = `${this.apiUrl}/tramite`;

    list(opts: VMTramiteListaOptions): Observable<VMPage<VMTramiteListaSimple>> {
        const dto: DTOTramiteListaOptions = MapTramiteListaOpciones(opts);
        const params = toHttpParams(dto);

        return this.http
        .get<ApiTramitePageSimple>(this.base, { params })
        .pipe(
            map(apiPage =>
            MapPageToVM<ApiTramiteListaSimple, VMTramiteListaSimple>(
                apiPage,
                MapTramiteListaItemVM,
            ),
            ),
        );
    }

    async create(vm: VMTramiteCreate): Promise<number> {
        const dto: DTOTramiteCreate = MapTramiteCreate(vm);

        const response = await firstValueFrom(
        this.http.post<{ tr_ID: number }>(this.base, dto),
        );

        return response.tr_ID;
    }

    getById(id: number): Observable<VMTramiteDetalleSimple> {
        return this.http
        .get<ApiTramiteDetalleSimple>(`${this.base}/${id}`)
        .pipe(map(apiItem => MapTramiteDetalleVM(apiItem)));
    }

    async update(id: number, changes: Partial<VMTramiteUpdate>): Promise<number> {
        const dto: DTOTramiteUpdate = MapTramiteUpdateParcial(id, changes);

        const response = await firstValueFrom(
        this.http.patch<{ tr_ID: number }>(`${this.base}/${id}`, dto),
        );

        return response.tr_ID;
    }

    getControlById(id: number): Observable<VMTramiteControl> {
        return this.http
        .get<ApiTramiteControl>(`${this.base}/${id}/control`)
        .pipe(map(apiItem => MapTramiteControl(apiItem)));
    }
}