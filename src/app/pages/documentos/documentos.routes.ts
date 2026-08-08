// src/app/pages/documentos/documentos.routes.ts

import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

import { DocumentosListaGeneral } from './documentos.lista.general/documentos.lista.general';
import { DocumentosRegistrar } from './documentos.registrar/documentos.registrar';
import { DocumentosRutaBaseLista } from './documentos.ruta-base.lista/documentos.ruta-base.lista';
import { DocumentosRutaBaseRegistrar } from './documentos.ruta-base.registrar/documentos.ruta-base.registrar';

export const documentosRoutes: Routes = [
  {
    path: 'documentos',
    canMatch: [accessGuardMatch],
    children: [
      {
        path: '',
        component: DocumentosListaGeneral,
        data: { minLevel: 3 },
        pathMatch: 'full',
      },
      {
        path: 'registrar',
        component: DocumentosRegistrar,
        data: { minLevel: 3 },
        pathMatch: 'full',
      },
      {
        path: 'rutas-base',
        component: DocumentosRutaBaseLista,
        data: { minLevel: 3 },
        pathMatch: 'full',
      },
      {
        path: 'rutas-base/registrar',
        component: DocumentosRutaBaseRegistrar,
        data: { minLevel: 3 },
        pathMatch: 'full',
      },
      {
        path: '**',
        component: PaginaNoEncontradaComponent,
      },
    ],
  },
];