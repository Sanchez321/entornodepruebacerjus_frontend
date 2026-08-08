
import { Routes } from '@angular/router';

import { Main_layout } from './layouts/main_layout/main_layout';
import { Simple_layout } from './layouts/simple_layout/simple_layout';

import { ciudadanoRoutes } from './pages/ciudadano/ciudadano.routes';
import { consultaRoutes } from './pages/consulta/consulta.routes';
import { seguimientoRoutes } from './pages/seguimiento/seguimiento.routes';
import { asistenciaRoutes } from './pages/asistencia/asistencia.routes';
import { loginRoutes ,cuentaRoutes,confirmarCorreoRoutes } from './pages/cuenta/cuenta.routes';
import { analiticasRoutes } from './pages/analiticas/analiticas.routes';
import { horarioRoutes} from './pages/horario/horario.routes'
import { asistenciaanaliticasRoutes} from './pages/asistencia.analiticas/asistencia.analiticas.routes'
import { justificacionRoutes} from './pages/justificacion/justificacion.routes'
import { adminRoutes } from './pages/admin/admin.router'
import { PaginaNoEncontradaComponent } from './components/paginanoencontrada/pagina';
import { procesoRoutes } from './pages/proceso/proceso.routes';
import { tramiteRoutes } from './pages/tramite/tramite.routes';
import { audienciaRoutes } from './pages/audiencia/audiencia.routes';
import { documentosRoutes } from './pages/documentos/documentos.routes';

export const routes: Routes = [
    {path:'', component: Simple_layout,
        children:[
            {path:'', redirectTo:'login', pathMatch:'full', },
            ...loginRoutes,
            ...confirmarCorreoRoutes,
        ]
    },
    {path:'', component: Main_layout,
        children:[
            ...asistenciaRoutes,
            ...ciudadanoRoutes,
            ...consultaRoutes,
            ...seguimientoRoutes,
            ...analiticasRoutes,
            ...horarioRoutes,
            ...asistenciaanaliticasRoutes,
            ...cuentaRoutes,
            ...adminRoutes,
            ...justificacionRoutes,
            ...procesoRoutes,
            ...tramiteRoutes,
            ...audienciaRoutes,
            ...documentosRoutes,
   
        ]
    },
    {path:'**', component: PaginaNoEncontradaComponent },
];
