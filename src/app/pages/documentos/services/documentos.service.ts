// src/app/pages/documentos/services/documentos.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';

import {ApiDocumentoRutaBaseDetalle,ApiDocumentoRutaBasePage,ApiDocumentoPage,} from '../models/documentos.api';
import {VMDocumentoRutaBaseCreate,VMDocumentoRutaBaseDetalle,VMDocumentoRutaBaseListaOptions,VMDocumentoRutaBaseListaSimple,
  VMDocumentoRutaBaseUpdate,VMPage,VMDocumentoListaOptions, VMDocumentoListaSimple,VMDocumentoSubir,} from '../models/documentos.vm';
import {DTODocumentoRutaBaseCreate,DTODocumentoRutaBaseListaOptions,DTODocumentoRutaBaseUpdate,} from '../models/documentos.dtos';
import {MapDocumentoRutaBaseCreate,MapDocumentoRutaBaseDetalleVM,MapDocumentoRutaBaseListaItemVM,MapDocumentoRutaBaseListaOpciones,
  MapDocumentoRutaBaseUpdate,MapPageToVM,MapDocumentoListaItemVM, MapDocumentoListaOpciones, MapDocumentoSubirFormData,
  } from '../mappers/documentos.mapper';

@Injectable({ providedIn: 'root' })
export class DocumentosService {
    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);

    private readonly base = `${this.apiUrl}/documento`;

    listRutasBase(
        opts: VMDocumentoRutaBaseListaOptions,
    ): Observable<VMPage<VMDocumentoRutaBaseListaSimple>> {
        const dto: DTODocumentoRutaBaseListaOptions =
        MapDocumentoRutaBaseListaOpciones(opts);

        const params = toHttpParams(dto);

        return this.http
        .get<ApiDocumentoRutaBasePage>(`${this.base}/rutas-base`, { params })
        .pipe(
            map((apiPage) =>
            MapPageToVM(
                apiPage,
                MapDocumentoRutaBaseListaItemVM,
            ),
            ),
        );
    }

    getRutaBaseById(id: number): Observable<VMDocumentoRutaBaseDetalle> {
        return this.http
        .get<ApiDocumentoRutaBaseDetalle>(`${this.base}/rutas-base/${id}`)
        .pipe(map((apiItem) => MapDocumentoRutaBaseDetalleVM(apiItem)));
    }

    async createRutaBase(vm: VMDocumentoRutaBaseCreate): Promise<number> {
        const dto: DTODocumentoRutaBaseCreate = MapDocumentoRutaBaseCreate(vm);

        const response = await firstValueFrom(
        this.http.post<{ drb_ID: number }>(`${this.base}/rutas-base`, dto),
        );

        return response.drb_ID;
    }

    async updateRutaBase(
        id: number,
        changes: Partial<VMDocumentoRutaBaseUpdate>,
    ): Promise<number> {
        const dto: DTODocumentoRutaBaseUpdate = MapDocumentoRutaBaseUpdate(changes);

        const response = await firstValueFrom(
        this.http.patch<{ drb_ID: number }>(
            `${this.base}/rutas-base/${id}`,
            dto,
        ),
        );

        return response.drb_ID;
    }

    async eliminarRutaBase(id: number): Promise<number> {
        const response = await firstValueFrom(
        this.http.patch<{ drb_ID: number }>(
            `${this.base}/rutas-base/${id}/eliminar`,
            {},
        ),
        );

        return response.drb_ID;
    }

    listDocumentos(
        opts: VMDocumentoListaOptions,
    ): Observable<VMPage<VMDocumentoListaSimple>> {
        const dto = MapDocumentoListaOpciones(opts);
        const params = toHttpParams(dto);

        return this.http
        .get<ApiDocumentoPage>(this.base, { params })
        .pipe(
            map((apiPage) =>
            MapPageToVM(
                apiPage,
                MapDocumentoListaItemVM,
            ),
            ),
        );
    }

    listDocumentosPorEntidad(
        tipo: 'PROCESO' | 'TRAMITE',
        id: number,
        opts: VMDocumentoListaOptions,
    ): Observable<VMPage<VMDocumentoListaSimple>> {
        const dto = MapDocumentoListaOpciones(opts);
        const params = toHttpParams(dto);

        return this.http
        .get<ApiDocumentoPage>(`${this.base}/entidad/${tipo}/${id}`, { params })
        .pipe(
            map((apiPage) =>
            MapPageToVM(
                apiPage,
                MapDocumentoListaItemVM,
            ),
            ),
        );
    }

    async subirDocumento(vm: VMDocumentoSubir): Promise<number> {
        const formData = MapDocumentoSubirFormData(vm);

        const response = await firstValueFrom(
        this.http.post<{ doc_ID: number }>(`${this.base}/subir`, formData),
        );

        return response.doc_ID;
    }

    async eliminarDocumento(id: number): Promise<number> {
        const response = await firstValueFrom(
        this.http.patch<{ doc_ID: number }>(
            `${this.base}/${id}/eliminar`,
            {},
        ),
        );

        return response.doc_ID;
    }

    abrirDocumento(vm: VMDocumentoListaSimple): void {
        if (!vm.driveWebViewLink) {
        throw new Error('El documento no tiene enlace de visualización.');
        }

        window.open(vm.driveWebViewLink, '_blank', 'noopener,noreferrer');
    }
    async reactivarDocumento(id: number): Promise<number> {
        const response = await firstValueFrom(
            this.http.patch<{ doc_ID: number }>(
            `${this.base}/${id}/reactivar`,
            {},
            ),
        );

        return response.doc_ID;
    }
}