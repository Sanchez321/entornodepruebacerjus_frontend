// src/app/pages/audiencia/audiencia.routes.ts

import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { AudienciaCalendario } from './audiencia.calendario/audiencia.calendario';
import { AudienciaRegistrar } from './audiencia.registrar/audiencia.registrar';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';
import { AudienciaDetalle } from './audiencia.detalle/audiencia.detalle';

export const audienciaRoutes: Routes = [
    {
        path: 'audiencia',
        canMatch: [accessGuardMatch],
        children: [
            
            {path: '',component: AudienciaCalendario,data: { minLevel: 3 },pathMatch: 'full',},
            {path: 'registrar',component: AudienciaRegistrar,data: { minLevel: 3 },pathMatch: 'full',},
            {path: ':idaudiencia',component: AudienciaDetalle,data: { minLevel: 3 },},
            {path: '**',component: PaginaNoEncontradaComponent,},
        ],
    },
];