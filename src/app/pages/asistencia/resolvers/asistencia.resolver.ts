import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AsistenciaService } from '../services/asistencia.service';

export const asistenciaResolver: ResolveFn<unknown> = (route) => {
  const service = inject(AsistenciaService);
  const page = Number(route.queryParamMap.get('page') ?? 1);
  const pageSize = Number(route.queryParamMap.get('pageSize') ?? 7);

  return service.list({ page, pageSize, sort: 'ma_fecha:desc' });
};
