import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export type DriveSaveStatus = 'NOT_REQUESTED' | 'SAVED' | 'FAILED';

export interface ArchivoExportacionResultado {
  filename: string;
  driveStatus: DriveSaveStatus;
  driveCode: string | null;
  driveMessage: string | null;
  driveUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class ArchivoExportacionService {
  private readonly http = inject(HttpClient);

  descargar(input: {
    url: string;
    params?: HttpParams;
    guardarDrive: boolean;
    fallbackFilename: string;
  }): Observable<ArchivoExportacionResultado> {
    const params = (input.params ?? new HttpParams()).set(
      'guardarDrive',
      String(input.guardarDrive),
    );

    return this.http.get(input.url, {
      params,
      observe: 'response',
      responseType: 'blob',
    }).pipe(
      map((response) => this.processResponse(response, input.fallbackFilename)),
    );
  }

  private processResponse(
    response: HttpResponse<Blob>,
    fallbackFilename: string,
  ): ArchivoExportacionResultado {
    const blob = response.body ?? new Blob();
    const filename = this.filenameFromHeader(
      response.headers.get('content-disposition'),
    ) ?? fallbackFilename;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const status = (response.headers.get('x-drive-save-status') ??
      'NOT_REQUESTED') as DriveSaveStatus;

    return {
      filename,
      driveStatus: status,
      driveCode: response.headers.get('x-drive-save-code'),
      driveMessage: this.decodeHeader(
        response.headers.get('x-drive-save-message'),
      ),
      driveUrl: this.decodeHeader(
        response.headers.get('x-drive-save-url'),
      ),
    };
  }

  private filenameFromHeader(value: string | null): string | null {
    if (!value) return null;

    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(value)?.[1];
    if (utf8) {
      try { return decodeURIComponent(utf8); } catch { return utf8; }
    }

    return /filename="?([^";]+)"?/i.exec(value)?.[1] ?? null;
  }

  private decodeHeader(value: string | null): string | null {
    if (!value) return null;
    try { return decodeURIComponent(value); } catch { return value; }
  }
}
