// src/app/pages/proceso/services/proceso.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';
import {
  ApiProcesoAsesorActual,
  ApiProcesoControl,
  ApiProcesoDetalleSimple,
  ApiProcesoListaSimple,
  ApiProcesoPageSimple,
} from '../models/proceso.api';
import {
  VMPage,
  VMProcesoAsesorActual,
  VMProcesoControl,
  VMProcesoCreate,
  VMProcesoDetalleSimple,
  VMProcesoListaOptions,
  VMProcesoListaSimple,
  VMProcesoReporteTablaOptions,
  VMProcesoUpdate,
} from '../models/proceso.vm';
import {
  DTOProcesoCreate,
  DTOProcesoListaOptions,
  DTOProcesoUpdate,
} from '../models/proceso.dtos';
import {
  MapPageToVM,
  MapProcesoAsesorActual,
  MapProcesoControl,
  MapProcesoCreate,
  MapProcesoDetalleVM,
  MapProcesoListaItemVM,
  MapProcesoListaOpciones,
  MapProcesoUpdateParcial,
} from '../mappers/proceso.mapper';

export interface ReporteDescargaResultado {
  driveStatus: string | null;
  driveMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProcesoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/proceso`;
  private readonly baseReportes = `${this.apiUrl}/reportes/tablas`;

  list(
    opts: VMProcesoListaOptions,
  ): Observable<VMPage<VMProcesoListaSimple>> {
    const dto: DTOProcesoListaOptions = MapProcesoListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiProcesoPageSimple>(this.base, { params })
      .pipe(
        map((apiPage) =>
          MapPageToVM<ApiProcesoListaSimple, VMProcesoListaSimple>(
            apiPage,
            MapProcesoListaItemVM,
          ),
        ),
      );
  }

  async create(vm: VMProcesoCreate): Promise<number> {
    const dto: DTOProcesoCreate = MapProcesoCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ pr_ID: number }>(this.base, dto),
    );

    return response.pr_ID;
  }

  getById(id: number): Observable<VMProcesoDetalleSimple> {
    return this.http
      .get<ApiProcesoDetalleSimple>(`${this.base}/${id}`)
      .pipe(map((apiItem) => MapProcesoDetalleVM(apiItem)));
  }

  async update(
    id: number,
    changes: Partial<VMProcesoUpdate>,
  ): Promise<number> {
    const dto: DTOProcesoUpdate = MapProcesoUpdateParcial(id, changes);
    const response = await firstValueFrom(
      this.http.patch<{ pr_ID: number }>(`${this.base}/${id}`, dto),
    );

    return response.pr_ID;
  }

  getControlById(id: number): Observable<VMProcesoControl> {
    return this.http
      .get<ApiProcesoControl>(`${this.base}/${id}/control`)
      .pipe(map((apiItem) => MapProcesoControl(apiItem)));
  }

  async asignarme(id: number): Promise<VMProcesoAsesorActual> {
    const response = await firstValueFrom(
      this.http.patch<ApiProcesoAsesorActual>(
        `${this.base}/${id}/asignarme`,
        {},
      ),
    );

    return MapProcesoAsesorActual(response);
  }

  async descargarProcesosTabla(
    opts: VMProcesoReporteTablaOptions,
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
      this.http.get(`${this.baseReportes}/procesos/exportar`, {
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
    opts: VMProcesoReporteTablaOptions,
  ): string {
    const mes = String(opts.mes).padStart(2, '0');

    return `procesos_${opts.modo.toLowerCase()}_${mes}_${opts.anio}.${opts.formato}`;
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
