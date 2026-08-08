'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">frontend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Type to search">
    <button type="button"
        class="search-input-clear"
        aria-label="Clear search"
        data-search-input-clear>&times;</button>
</div>
` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="architecture.html" data-type="chapter-link">
                                        <span class="icon ion-ios-git-branch"></span>Architecture
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AnaliticasDashboard.html" data-type="entity-link" >AnaliticasDashboard</a>
                            </li>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/AsistenciaLista.html" data-type="entity-link" >AsistenciaLista</a>
                            </li>
                            <li class="link">
                                <a href="components/AsistenciasDashboard.html" data-type="entity-link" >AsistenciasDashboard</a>
                            </li>
                            <li class="link">
                                <a href="components/AudienciaCalendario.html" data-type="entity-link" >AudienciaCalendario</a>
                            </li>
                            <li class="link">
                                <a href="components/AudienciaDetalle.html" data-type="entity-link" >AudienciaDetalle</a>
                            </li>
                            <li class="link">
                                <a href="components/AudienciaRegistrar.html" data-type="entity-link" >AudienciaRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/CiudadanoDetalle.html" data-type="entity-link" >CiudadanoDetalle</a>
                            </li>
                            <li class="link">
                                <a href="components/CiudadanoLista.html" data-type="entity-link" >CiudadanoLista</a>
                            </li>
                            <li class="link">
                                <a href="components/CiudadanoRegistrar.html" data-type="entity-link" >CiudadanoRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmarCorreo.html" data-type="entity-link" >ConfirmarCorreo</a>
                            </li>
                            <li class="link">
                                <a href="components/ConsultaDetalle.html" data-type="entity-link" >ConsultaDetalle</a>
                            </li>
                            <li class="link">
                                <a href="components/ConsultaLista.html" data-type="entity-link" >ConsultaLista</a>
                            </li>
                            <li class="link">
                                <a href="components/ConsultaListaCiudadano.html" data-type="entity-link" >ConsultaListaCiudadano</a>
                            </li>
                            <li class="link">
                                <a href="components/ConsultaRegistar.html" data-type="entity-link" >ConsultaRegistar</a>
                            </li>
                            <li class="link">
                                <a href="components/DocumentosListaEntidad.html" data-type="entity-link" >DocumentosListaEntidad</a>
                            </li>
                            <li class="link">
                                <a href="components/DocumentosListaGeneral.html" data-type="entity-link" >DocumentosListaGeneral</a>
                            </li>
                            <li class="link">
                                <a href="components/DocumentosRegistrar.html" data-type="entity-link" >DocumentosRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/DocumentosRutaBaseLista.html" data-type="entity-link" >DocumentosRutaBaseLista</a>
                            </li>
                            <li class="link">
                                <a href="components/DocumentosRutaBaseRegistrar.html" data-type="entity-link" >DocumentosRutaBaseRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/ExportarConDriveComponent.html" data-type="entity-link" >ExportarConDriveComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/Footer.html" data-type="entity-link" >Footer</a>
                            </li>
                            <li class="link">
                                <a href="components/Header.html" data-type="entity-link" >Header</a>
                            </li>
                            <li class="link">
                                <a href="components/HorarioDetalle.html" data-type="entity-link" >HorarioDetalle</a>
                            </li>
                            <li class="link">
                                <a href="components/HorarioLista.html" data-type="entity-link" >HorarioLista</a>
                            </li>
                            <li class="link">
                                <a href="components/HorarioRegistrar.html" data-type="entity-link" >HorarioRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/Ingresar.html" data-type="entity-link" >Ingresar</a>
                            </li>
                            <li class="link">
                                <a href="components/JustificacionListaMis.html" data-type="entity-link" >JustificacionListaMis</a>
                            </li>
                            <li class="link">
                                <a href="components/JustificacionListaPendientes.html" data-type="entity-link" >JustificacionListaPendientes</a>
                            </li>
                            <li class="link">
                                <a href="components/JustificacionRegistrar.html" data-type="entity-link" >JustificacionRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/Main_layout.html" data-type="entity-link" >Main_layout</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificacionestVer.html" data-type="entity-link" >NotificacionestVer</a>
                            </li>
                            <li class="link">
                                <a href="components/PaginaNoEncontradaComponent.html" data-type="entity-link" >PaginaNoEncontradaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/Perfil.html" data-type="entity-link" >Perfil</a>
                            </li>
                            <li class="link">
                                <a href="components/ProcesoDetalle.html" data-type="entity-link" >ProcesoDetalle</a>
                            </li>
                            <li class="link">
                                <a href="components/ProcesoLista.html" data-type="entity-link" >ProcesoLista</a>
                            </li>
                            <li class="link">
                                <a href="components/ProcesoRegistrar.html" data-type="entity-link" >ProcesoRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/Registar.html" data-type="entity-link" >Registar</a>
                            </li>
                            <li class="link">
                                <a href="components/SeguimientoListaConsulta.html" data-type="entity-link" >SeguimientoListaConsulta</a>
                            </li>
                            <li class="link">
                                <a href="components/SeguimientoRegistar.html" data-type="entity-link" >SeguimientoRegistar</a>
                            </li>
                            <li class="link">
                                <a href="components/Sidebar.html" data-type="entity-link" >Sidebar</a>
                            </li>
                            <li class="link">
                                <a href="components/Simple_layout.html" data-type="entity-link" >Simple_layout</a>
                            </li>
                            <li class="link">
                                <a href="components/TramiteDetalle.html" data-type="entity-link" >TramiteDetalle</a>
                            </li>
                            <li class="link">
                                <a href="components/TramiteLista.html" data-type="entity-link" >TramiteLista</a>
                            </li>
                            <li class="link">
                                <a href="components/TramiteRegistrar.html" data-type="entity-link" >TramiteRegistrar</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuarioDetalle.html" data-type="entity-link" >UsuarioDetalle</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuarioHorarioListaUsuario.html" data-type="entity-link" >UsuarioHorarioListaUsuario</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuarioLista.html" data-type="entity-link" >UsuarioLista</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AnaliticasService.html" data-type="entity-link" >AnaliticasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ArchivoExportacionService.html" data-type="entity-link" >ArchivoExportacionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AsistenciasDashboardService.html" data-type="entity-link" >AsistenciasDashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AsistenciaService.html" data-type="entity-link" >AsistenciaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AudienciaService.html" data-type="entity-link" >AudienciaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthStore.html" data-type="entity-link" >AuthStore</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CiudadanoService.html" data-type="entity-link" >CiudadanoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConsultaService.html" data-type="entity-link" >ConsultaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CuentaService.html" data-type="entity-link" >CuentaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DocumentosService.html" data-type="entity-link" >DocumentosService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HorarioService.html" data-type="entity-link" >HorarioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JustificacionService.html" data-type="entity-link" >JustificacionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificacionesService.html" data-type="entity-link" >NotificacionesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificacionSistemaService.html" data-type="entity-link" >NotificacionSistemaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PageMetaService.html" data-type="entity-link" >PageMetaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaginaNoEncontradaService.html" data-type="entity-link" >PaginaNoEncontradaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProcesoService.html" data-type="entity-link" >ProcesoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SeguimientoService.html" data-type="entity-link" >SeguimientoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TramiteService.html" data-type="entity-link" >TramiteService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsuarioHorarioService.html" data-type="entity-link" >UsuarioHorarioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsuarioService.html" data-type="entity-link" >UsuarioService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/accessGuardMatch.html" data-type="entity-link" >accessGuardMatch</a>
                            </li>
                            <li class="link">
                                <a href="guards/asistenciaResolver.html" data-type="entity-link" >asistenciaResolver</a>
                            </li>
                            <li class="link">
                                <a href="guards/ciudadanoResolver.html" data-type="entity-link" >ciudadanoResolver</a>
                            </li>
                            <li class="link">
                                <a href="guards/ciudadanoResolver-1.html" data-type="entity-link" >ciudadanoResolver</a>
                            </li>
                            <li class="link">
                                <a href="guards/loginGuardMactch.html" data-type="entity-link" >loginGuardMactch</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaBarras.html" data-type="entity-link" >ApiAsistenciaBarras</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaCards.html" data-type="entity-link" >ApiAsistenciaCards</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaDashboardResponse.html" data-type="entity-link" >ApiAsistenciaDashboardResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaDiaUsuario.html" data-type="entity-link" >ApiAsistenciaDiaUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaDimUsuario.html" data-type="entity-link" >ApiAsistenciaDimUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaEtlRun.html" data-type="entity-link" >ApiAsistenciaEtlRun</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaEtlRunResponse.html" data-type="entity-link" >ApiAsistenciaEtlRunResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaEtlStatus.html" data-type="entity-link" >ApiAsistenciaEtlStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaHoy.html" data-type="entity-link" >ApiAsistenciaHoy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaJustificacionItem.html" data-type="entity-link" >ApiAsistenciaJustificacionItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaJustificacionResumen.html" data-type="entity-link" >ApiAsistenciaJustificacionResumen</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaListaSimple.html" data-type="entity-link" >ApiAsistenciaListaSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaPageSimple.html" data-type="entity-link" >ApiAsistenciaPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAsistenciaPeriodoPageResponse.html" data-type="entity-link" >ApiAsistenciaPeriodoPageResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAudiencia.html" data-type="entity-link" >ApiAudiencia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAudienciaAsesorResumen.html" data-type="entity-link" >ApiAudienciaAsesorResumen</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAudienciaCalendarioItem.html" data-type="entity-link" >ApiAudienciaCalendarioItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAudienciaCalendarioSemana.html" data-type="entity-link" >ApiAudienciaCalendarioSemana</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAudienciaControl.html" data-type="entity-link" >ApiAudienciaControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiAudienciaPageSimple.html" data-type="entity-link" >ApiAudienciaPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiCanalOtrosItem.html" data-type="entity-link" >ApiCanalOtrosItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiCiudadano.html" data-type="entity-link" >ApiCiudadano</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiCiudadanoControl.html" data-type="entity-link" >ApiCiudadanoControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiCiudadanoEdadItem.html" data-type="entity-link" >ApiCiudadanoEdadItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiCiudadanoPageSimple.html" data-type="entity-link" >ApiCiudadanoPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiConsulta.html" data-type="entity-link" >ApiConsulta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiConsultaCiudadanoResumen.html" data-type="entity-link" >ApiConsultaCiudadanoResumen</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiConsultaControl.html" data-type="entity-link" >ApiConsultaControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiConsultaPageCiudadanoSimple.html" data-type="entity-link" >ApiConsultaPageCiudadanoSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiConsultaPageGeneralSimple.html" data-type="entity-link" >ApiConsultaPageGeneralSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiDocumentoListaItem.html" data-type="entity-link" >ApiDocumentoListaItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiDocumentoPage.html" data-type="entity-link" >ApiDocumentoPage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiDocumentoRutaBaseDetalle.html" data-type="entity-link" >ApiDocumentoRutaBaseDetalle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiDocumentoRutaBaseListaItem.html" data-type="entity-link" >ApiDocumentoRutaBaseListaItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiEtlRunning.html" data-type="entity-link" >ApiEtlRunning</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiEtlStatus.html" data-type="entity-link" >ApiEtlStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiHorario.html" data-type="entity-link" >ApiHorario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiHorarioBloque.html" data-type="entity-link" >ApiHorarioBloque</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiHorarioDetalle.html" data-type="entity-link" >ApiHorarioDetalle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiHorarioHoy.html" data-type="entity-link" >ApiHorarioHoy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiHorarioListaSimple.html" data-type="entity-link" >ApiHorarioListaSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiHorarioPageSimple.html" data-type="entity-link" >ApiHorarioPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiKpis.html" data-type="entity-link" >ApiKpis</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiMateriaOtrosItem.html" data-type="entity-link" >ApiMateriaOtrosItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiMiHorarioHoyResponse.html" data-type="entity-link" >ApiMiHorarioHoyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiMisNotificaciones.html" data-type="entity-link" >ApiMisNotificaciones</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiNotificacionSistemaItem.html" data-type="entity-link" >ApiNotificacionSistemaItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiPage.html" data-type="entity-link" >ApiPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiPage-1.html" data-type="entity-link" >ApiPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiPastelMateriasItem.html" data-type="entity-link" >ApiPastelMateriasItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiProceso.html" data-type="entity-link" >ApiProceso</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiProcesoAsesorActual.html" data-type="entity-link" >ApiProcesoAsesorActual</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiProcesoControl.html" data-type="entity-link" >ApiProcesoControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiProcesoPageSimple.html" data-type="entity-link" >ApiProcesoPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiPunchResponse.html" data-type="entity-link" >ApiPunchResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiResetContrasenaProvisionalResponse.html" data-type="entity-link" >ApiResetContrasenaProvisionalResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiSeguimiento.html" data-type="entity-link" >ApiSeguimiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiSeguimientoPageSimple.html" data-type="entity-link" >ApiSeguimientoPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiSerieAtenciones.html" data-type="entity-link" >ApiSerieAtenciones</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiSerieAudiencias.html" data-type="entity-link" >ApiSerieAudiencias</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiSerieCiudadanos.html" data-type="entity-link" >ApiSerieCiudadanos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiSerieProcesos.html" data-type="entity-link" >ApiSerieProcesos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiSerieTramites.html" data-type="entity-link" >ApiSerieTramites</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiTipoUsuario.html" data-type="entity-link" >ApiTipoUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiTramite.html" data-type="entity-link" >ApiTramite</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiTramiteControl.html" data-type="entity-link" >ApiTramiteControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiTramitePageSimple.html" data-type="entity-link" >ApiTramitePageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuario.html" data-type="entity-link" >ApiUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuarioCorregirIdentidadResponse.html" data-type="entity-link" >ApiUsuarioCorregirIdentidadResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuarioDeleteDefinitivoResponse.html" data-type="entity-link" >ApiUsuarioDeleteDefinitivoResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuarioHorarioDetail.html" data-type="entity-link" >ApiUsuarioHorarioDetail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuarioHorarioDetalleBloque.html" data-type="entity-link" >ApiUsuarioHorarioDetalleBloque</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuarioHorarioListaItem.html" data-type="entity-link" >ApiUsuarioHorarioListaItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuarioHorarioPageSimple.html" data-type="entity-link" >ApiUsuarioHorarioPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiUsuarioPageSimple.html" data-type="entity-link" >ApiUsuarioPageSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ArchivoExportacionResultado.html" data-type="entity-link" >ArchivoExportacionResultado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AudienciaRegistrarForm.html" data-type="entity-link" >AudienciaRegistrarForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfirmDialogOptions.html" data-type="entity-link" >ConfirmDialogOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CuentaPerfilForm.html" data-type="entity-link" >CuentaPerfilForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DiaCalendario.html" data-type="entity-link" >DiaCalendario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentoEntidadSubirForm.html" data-type="entity-link" >DocumentoEntidadSubirForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentoRutaBaseRegistrarForm.html" data-type="entity-link" >DocumentoRutaBaseRegistrarForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosRegistrarForm.html" data-type="entity-link" >DocumentosRegistrarForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOAsistenciaJustificacionCreate.html" data-type="entity-link" >DTOAsistenciaJustificacionCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOAsistenciaJustificacionDecision.html" data-type="entity-link" >DTOAsistenciaJustificacionDecision</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOAsistenciaListaOptions.html" data-type="entity-link" >DTOAsistenciaListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOAudienciaCalendarioSemanaOptions.html" data-type="entity-link" >DTOAudienciaCalendarioSemanaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOAudienciaCreate.html" data-type="entity-link" >DTOAudienciaCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOAudienciaListaOptions.html" data-type="entity-link" >DTOAudienciaListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOAudienciaUpdate.html" data-type="entity-link" >DTOAudienciaUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCiudadano.html" data-type="entity-link" >DTOCiudadano</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOConsulta.html" data-type="entity-link" >DTOConsulta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCorregirSalida.html" data-type="entity-link" >DTOCorregirSalida</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCreateMarca.html" data-type="entity-link" >DTOCreateMarca</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCuenta.html" data-type="entity-link" >DTOCuenta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCuentaChangePassword.html" data-type="entity-link" >DTOCuentaChangePassword</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCuentaConfirmarCorreoResponse.html" data-type="entity-link" >DTOCuentaConfirmarCorreoResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCuentaPerfil.html" data-type="entity-link" >DTOCuentaPerfil</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOCuentaPerfilUpdate.html" data-type="entity-link" >DTOCuentaPerfilUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTODocumentoListaOptions.html" data-type="entity-link" >DTODocumentoListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTODocumentoRutaBaseCreate.html" data-type="entity-link" >DTODocumentoRutaBaseCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTODocumentoRutaBaseListaOptions.html" data-type="entity-link" >DTODocumentoRutaBaseListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTODocumentoRutaBaseUpdate.html" data-type="entity-link" >DTODocumentoRutaBaseUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOHorarioBloqueCreate.html" data-type="entity-link" >DTOHorarioBloqueCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOHorarioCreate.html" data-type="entity-link" >DTOHorarioCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOHorarioListaOptions.html" data-type="entity-link" >DTOHorarioListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOProcesoCreate.html" data-type="entity-link" >DTOProcesoCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOProcesoListaOptions.html" data-type="entity-link" >DTOProcesoListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOProcesoUpdate.html" data-type="entity-link" >DTOProcesoUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOSeguimiento.html" data-type="entity-link" >DTOSeguimiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOTramiteCreate.html" data-type="entity-link" >DTOTramiteCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOTramiteListaOptions.html" data-type="entity-link" >DTOTramiteListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOTramiteUpdate.html" data-type="entity-link" >DTOTramiteUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOUsuario.html" data-type="entity-link" >DTOUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOUsuarioCorregirIdentidad.html" data-type="entity-link" >DTOUsuarioCorregirIdentidad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOUsuarioHorarioCreate.html" data-type="entity-link" >DTOUsuarioHorarioCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOUsuarioHorarioListaOptions.html" data-type="entity-link" >DTOUsuarioHorarioListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DTOUsuarioHorarioUpdate.html" data-type="entity-link" >DTOUsuarioHorarioUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoadingState.html" data-type="entity-link" >LoadingState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginResponse.html" data-type="entity-link" >LoginResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OkDialogOptions.html" data-type="entity-link" >OkDialogOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PageMeta.html" data-type="entity-link" >PageMeta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcesoRegistrarForm.html" data-type="entity-link" >ProcesoRegistrarForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReporteDescargaResultado.html" data-type="entity-link" >ReporteDescargaResultado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReporteDescargaResultado-1.html" data-type="entity-link" >ReporteDescargaResultado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReporteDescargaResultado-2.html" data-type="entity-link" >ReporteDescargaResultado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TramiteRegistrarForm.html" data-type="entity-link" >TramiteRegistrarForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UsuarioCorregirIdentidadFormLocal.html" data-type="entity-link" >UsuarioCorregirIdentidadFormLocal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UsuarioDetalleForm.html" data-type="entity-link" >UsuarioDetalleForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaCards.html" data-type="entity-link" >VMAsistenciaCards</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaDashboard.html" data-type="entity-link" >VMAsistenciaDashboard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaDimUsuario.html" data-type="entity-link" >VMAsistenciaDimUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaEtlStatus.html" data-type="entity-link" >VMAsistenciaEtlStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaHoy.html" data-type="entity-link" >VMAsistenciaHoy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaJustificacionCreate.html" data-type="entity-link" >VMAsistenciaJustificacionCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaJustificacionItem.html" data-type="entity-link" >VMAsistenciaJustificacionItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaJustificacionListaOptions.html" data-type="entity-link" >VMAsistenciaJustificacionListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaJustificacionResumen.html" data-type="entity-link" >VMAsistenciaJustificacionResumen</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaListaOptions.html" data-type="entity-link" >VMAsistenciaListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaListaSimple.html" data-type="entity-link" >VMAsistenciaListaSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaPeriodoPage.html" data-type="entity-link" >VMAsistenciaPeriodoPage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAsistenciaQuery.html" data-type="entity-link" >VMAsistenciaQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAudiencia.html" data-type="entity-link" >VMAudiencia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAudienciaAsesorResumen.html" data-type="entity-link" >VMAudienciaAsesorResumen</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAudienciaCalendarioSemana.html" data-type="entity-link" >VMAudienciaCalendarioSemana</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAudienciaCalendarioSemanaOptions.html" data-type="entity-link" >VMAudienciaCalendarioSemanaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMAudienciaControl.html" data-type="entity-link" >VMAudienciaControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMBarrasApiladas.html" data-type="entity-link" >VMBarrasApiladas</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMBarrasAsistencia.html" data-type="entity-link" >VMBarrasAsistencia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCanalOtrosItem.html" data-type="entity-link" >VMCanalOtrosItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMChartSerie.html" data-type="entity-link" >VMChartSerie</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCiudadano.html" data-type="entity-link" >VMCiudadano</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCiudadanoControl.html" data-type="entity-link" >VMCiudadanoControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCiudadanoEdad.html" data-type="entity-link" >VMCiudadanoEdad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCiudadanoReporteTablaOptions.html" data-type="entity-link" >VMCiudadanoReporteTablaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMConsulta.html" data-type="entity-link" >VMConsulta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMConsultaCiudadanoResumen.html" data-type="entity-link" >VMConsultaCiudadanoResumen</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMConsultaControl.html" data-type="entity-link" >VMConsultaControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMConsultaReporteTablaOptions.html" data-type="entity-link" >VMConsultaReporteTablaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCuenta.html" data-type="entity-link" >VMCuenta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCuentaChangePassword.html" data-type="entity-link" >VMCuentaChangePassword</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCuentaConfirmarCorreoResponse.html" data-type="entity-link" >VMCuentaConfirmarCorreoResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMCuentaPerfil.html" data-type="entity-link" >VMCuentaPerfil</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDimCanal.html" data-type="entity-link" >VMDimCanal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDimMateria.html" data-type="entity-link" >VMDimMateria</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDimUsuario.html" data-type="entity-link" >VMDimUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoListaOptions.html" data-type="entity-link" >VMDocumentoListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoListaSimple.html" data-type="entity-link" >VMDocumentoListaSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoProcesoSubirForm.html" data-type="entity-link" >VMDocumentoProcesoSubirForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoRutaBaseCreate.html" data-type="entity-link" >VMDocumentoRutaBaseCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoRutaBaseDetalle.html" data-type="entity-link" >VMDocumentoRutaBaseDetalle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoRutaBaseListaOptions.html" data-type="entity-link" >VMDocumentoRutaBaseListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoRutaBaseListaSimple.html" data-type="entity-link" >VMDocumentoRutaBaseListaSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoRutaBaseUpdate.html" data-type="entity-link" >VMDocumentoRutaBaseUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMDocumentoSubir.html" data-type="entity-link" >VMDocumentoSubir</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMEstadoActualRow.html" data-type="entity-link" >VMEstadoActualRow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMEtlRunResponse.html" data-type="entity-link" >VMEtlRunResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMEtlStatus.html" data-type="entity-link" >VMEtlStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMHorario.html" data-type="entity-link" >VMHorario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMHorarioBloque.html" data-type="entity-link" >VMHorarioBloque</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMHorarioBloqueForm.html" data-type="entity-link" >VMHorarioBloqueForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMHorarioCreate.html" data-type="entity-link" >VMHorarioCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMHorarioDetalle.html" data-type="entity-link" >VMHorarioDetalle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMHorarioHoy.html" data-type="entity-link" >VMHorarioHoy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMHorarioListaOptions.html" data-type="entity-link" >VMHorarioListaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMKpis.html" data-type="entity-link" >VMKpis</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMLineaCiudadanos.html" data-type="entity-link" >VMLineaCiudadanos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMMateriaOtrosItem.html" data-type="entity-link" >VMMateriaOtrosItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMMiHorarioHoy.html" data-type="entity-link" >VMMiHorarioHoy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-1.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-2.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-3.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-4.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-5.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-6.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-7.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-8.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-9.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-10.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPage-11.html" data-type="entity-link" >VMPage&lt;T&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPastelMaterias.html" data-type="entity-link" >VMPastelMaterias</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMPeriodQuery.html" data-type="entity-link" >VMPeriodQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMProceso.html" data-type="entity-link" >VMProceso</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMProcesoAsesorActual.html" data-type="entity-link" >VMProcesoAsesorActual</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMProcesoControl.html" data-type="entity-link" >VMProcesoControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMProcesoReporteTablaOptions.html" data-type="entity-link" >VMProcesoReporteTablaOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMSeguimiento.html" data-type="entity-link" >VMSeguimiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMSerieSimple.html" data-type="entity-link" >VMSerieSimple</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMTramite.html" data-type="entity-link" >VMTramite</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMTramiteControl.html" data-type="entity-link" >VMTramiteControl</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMUsuario.html" data-type="entity-link" >VMUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMUsuarioCorregirIdentidadForm.html" data-type="entity-link" >VMUsuarioCorregirIdentidadForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMUsuarioHorarioCreate.html" data-type="entity-link" >VMUsuarioHorarioCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMUsuarioHorarioListaItem.html" data-type="entity-link" >VMUsuarioHorarioListaItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VMUsuarioHorarioListaOptions.html" data-type="entity-link" >VMUsuarioHorarioListaOptions</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
