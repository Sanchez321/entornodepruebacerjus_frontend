// src/app/pages/tramite/tramite.routes.ts

import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { TramiteLista } from './tramite.lista/tramite.lista';
import { TramiteRegistrar } from './tramite.registrar/tramite.registrar';
import { TramiteDetalle } from './tramite.detalle/tramite.detalle';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const tramiteRoutes: Routes = [
  {
    path: 'tramite',
    canMatch: [accessGuardMatch],
    children: [
      { path: '', component: TramiteLista, data: { minLevel: 3 }, pathMatch: 'full' },
      { path: 'registrar', component: TramiteRegistrar, data: { minLevel: 3 }, pathMatch: 'full' },
      { path: ':idtramite', component: TramiteDetalle, data: { minLevel: 3 } },
      { path: '**', component: PaginaNoEncontradaComponent },
    ],
  },
];