// src/app/pages/ciudadano/services/ciudadano.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

import { API_URL } from '../../../app.token';
import {
  DTOCiudadanoCreate,
  DTOCiudadanoListaOptions,
  DTOCiudadanoUpdate,
} from '../models/ciudadano.dtos';
import {
  ApiCiudadanoControl,
  ApiCiudadanoDetalleSimple,
  ApiCiudadanoListaSimple,
  ApiCiudadanoPageSimple,
} from '../models/ciudadano.api';
import {
  VMCiudadanoControl,
  VMCiudadanoCreate,
  VMCiudadanoDetalleSimple,
  VMCiudadanoListaOptions,
  VMCiudadanoListaSimple,
  VMCiudadanoReporteTablaOptions,
  VMCiudadanoUpdate,
  VMPage,
} from '../models/ciudadano.vm';
import {
  MapCiudadanoControl,
  MapCiudadanoCreate,
  MapCiudadanoDetalleListaSimple,
  MapCiudadanoListaItemVM,
  MapCiudadanoListaOpciones,
  MapCiudadanoUpdateParcial,
  MapPageToVM,
} from '../mappers/ciudadano.mapper';
import { toHttpParams } from '@app/components/utils/http.utils';

export interface ReporteDescargaResultado {
  driveStatus: string | null;
  driveMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class CiudadanoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/ciudadano`;
  private readonly baseReportes = `${this.apiUrl}/reportes/tablas`;

  list(
    opts: VMCiudadanoListaOptions,
  ): Observable<VMPage<VMCiudadanoListaSimple>> {
    const dto: DTOCiudadanoListaOptions = MapCiudadanoListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiCiudadanoPageSimple>(this.base, { params })
      .pipe(
        map((apiPage) =>
          MapPageToVM<ApiCiudadanoListaSimple, VMCiudadanoListaSimple>(
            apiPage,
            MapCiudadanoListaItemVM,
          ),
        ),
      );
  }

  async create(vm: VMCiudadanoCreate): Promise<number> {
    const dto: DTOCiudadanoCreate = MapCiudadanoCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ ci_ID: number }>(this.base, dto),
    );

    return response.ci_ID;
  }

  getById(id: number): Observable<VMCiudadanoDetalleSimple> {
    return this.http
      .get<ApiCiudadanoDetalleSimple>(`${this.base}/${id}`)
      .pipe(map((apiItem) => MapCiudadanoDetalleListaSimple(apiItem)));
  }

  getControlById(id: number): Observable<VMCiudadanoControl> {
    return this.http
      .get<ApiCiudadanoControl>(`${this.base}/${id}/control`)
      .pipe(map((apiItem) => MapCiudadanoControl(apiItem)));
  }

  async update(
    id: number,
    changes: Partial<VMCiudadanoUpdate>,
  ): Promise<number> {
    const dto: DTOCiudadanoUpdate = MapCiudadanoUpdateParcial(id, changes);
    const response = await firstValueFrom(
      this.http.patch<{ ci_ID: number }>(`${this.base}/${id}`, dto),
    );

    return response.ci_ID;
  }

  async descargarCiudadanosTabla(
    opts: VMCiudadanoReporteTablaOptions,
    guardarDrive = false,
  ): Promise<ReporteDescargaResultado> {
    const params = toHttpParams({
      formato: opts.formato,
      modo: opts.modo,
      estado: opts.estado,
      anio: opts.anio,
      mes: opts.mes,
      guardarDrive,
    });

    const response = await firstValueFrom(
      this.http.get(`${this.baseReportes}/ciudadanos/exportar`, {
        params,
        responseType: 'blob',
        observe: 'response',
      }),
    );

    const blob = response.body;

    if (!blob) {
      throw new Error('No se recibió archivo.');
    }

    const filename =
      this.getFilenameFromContentDisposition(
        response.headers.get('content-disposition'),
      ) ?? this.buildFallbackReporteFilename(opts);

    this.downloadBlob(blob, filename);

    return {
      driveStatus: response.headers.get('x-drive-save-status'),
      driveMessage: this.decodeDriveMessage(
        response.headers.get('x-drive-save-message'),
      ),
    };
  }

  private buildFallbackReporteFilename(
    opts: VMCiudadanoReporteTablaOptions,
  ): string {
    const mes = String(opts.mes).padStart(2, '0');

    return `ciudadanos_${opts.modo.toLowerCase()}_${mes}_${opts.anio}.${opts.formato}`;
  }

  private getFilenameFromContentDisposition(
    value?: string | null,
  ): string | null {
    if (!value) return null;

    const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(value);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const normalMatch = /filename="?([^";]+)"?/i.exec(value);
    return normalMatch?.[1] ?? null;
  }

  private decodeDriveMessage(value: string | null): string | null {
    if (!value) return null;

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }
}
