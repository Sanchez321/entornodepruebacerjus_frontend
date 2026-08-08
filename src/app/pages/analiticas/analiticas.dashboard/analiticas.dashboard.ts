// src/app/pages/analiticas/analiticas.dashboard/analiticas.dashboard.ts

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {NgApexchartsModule,ApexAxisChartSeries,ApexChart,ApexDataLabels,ApexLegend,ApexPlotOptions,ApexTooltip,ApexXAxis,ApexStroke,
  ApexNonAxisChartSeries,} from 'ng-apexcharts';

import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subscription, forkJoin, of, Observable } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';


import { AnaliticasService } from '../services/analiticas.service';

import {PeriodoTipo,PeriodView,VMBarrasApiladas,VMCiudadanoEdad,VMDimCanal,VMDimMateria,
  VMDimUsuario,VMEtlStatus,VMKpis,VMLineaCiudadanos,VMMateriaOtrosItem,VMPastelMaterias,VMPeriodQuery,VMSerieSimple,
  } from '../models/analiticas.vm';

import { PageMetaService } from '@/app/services/page_meta.service';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

type ChartOptionsBar = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

type ChartOptionsLine = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

type ChartOptionsDonut = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
};

type EdadResumenRow = {
  rango: string;
  cantidad: number;
  porcentaje: number;
};

type DetalleConteoRow = {
  nombre: string;
  cantidad: number;
  porcentaje?: number;
};

@Component({
  selector: 'app-analiticas-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule],
  templateUrl: './analiticas.dashboard.html',
  styleUrls: ['./analiticas.dashboard.css'],
})
export class AnaliticasDashboard implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private svc = inject(AnaliticasService);
  private pageMeta = inject(PageMetaService);
  private notify = inject(NotificacionesService);

  private readonly analyticsTz = 'America/Lima';
  private readonly hoy = this.limaTodayDate();
  private readonly isoActual = this.isoWeekParts(this.hoy);

  readonly years = this.buildYears();

  readonly months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  readonly weeks = Array.from({ length: 53 }, (_, i) => ({
    value: i + 1,
    label: `Semana ${i + 1}`,
  }));

  filtros = this.fb.group({
    periodoTipo: ['week' as PeriodoTipo],
    year: [this.isoActual.year],
    month: [this.hoy.getMonth() + 1],
    week: [this.isoActual.week],
    start: [''],
    end: [''],
    view: ['day' as PeriodView],

    materia_id: [null as number | null],
    canal_id: [null as number | null],
    registrado_por_id: [null as number | null],
    asesor_id: [null as number | null],
  });

  etlStatus: VMEtlStatus | null = null;
  etlLabel = '—';
  periodMain = '';
  headerDetail = '';

  materias: VMDimMateria[] = [];
  canales: VMDimCanal[] = [];
  usuarios: VMDimUsuario[] = [];

  kpis: VMKpis | null = null;
  materiasOtros: VMMateriaOtrosItem[] = [];
  ciudadanosEdades: VMCiudadanoEdad[] = [];

  edadesResumen: EdadResumenRow[] = [];
  totalEdades = 0;

  conocioDetalle: DetalleConteoRow[] = [];
  conocioOtrosDetalle: DetalleConteoRow[] = [];

  optLine: ChartOptionsLine = this.makeLineOptions(320);
  optAtenciones: ChartOptionsBar = this.makeStackedBarOptions(320);
  optProcesos: ChartOptionsBar = this.makeSimpleBarOptions(300);
  optTramites: ChartOptionsBar = this.makeSimpleBarOptions(300);
  optAudiencias: ChartOptionsBar = this.makeSimpleBarOptions(300);
  optDonut: ChartOptionsDonut = this.makeDonutOptions(320);
  optConocio: ChartOptionsDonut = this.makeDonutOptions(320);

  loading = false;
  downloading = false;
  guardarDrive = false;
  firstLoad = true;
  showOverlay = false;

  private reqSeq = 0;
  private overlayTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;
  private readonly minOverlayMs = 220;
  private readonly firstSkeletonMinMs = 240;

  private sub?: Subscription;

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Analíticas',
    });

    this.loadEtlStatus();
    this.loadDimsAndData();

    this.sub = this.filtros.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe(() => this.loadAll());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.cancelTimers();
    this.pageMeta.clear();
  }

  get resumen(): VMKpis | null {
    return this.kpis;
  }

  get periodoTipo(): PeriodoTipo {
    return (this.filtros.controls.periodoTipo.value ?? 'week') as PeriodoTipo;
  }

  get isRange(): boolean {
    return this.periodoTipo === 'range';
  }

  get isWeek(): boolean {
    return this.periodoTipo === 'week';
  }

  get isMonth(): boolean {
    return this.periodoTipo === 'month';
  }

  get isYear(): boolean {
    return this.periodoTipo === 'year';
  }

  /* ======================================================
     CARGA GENERAL
     ====================================================== */

  private loadDimsAndData(): void {
    forkJoin({
      materias: this.svc.getDimMaterias().pipe(catchError(() => of([]))),
      canales: this.svc.getDimCanales().pipe(catchError(() => of([]))),
      usuarios: this.svc.getDimUsuarios().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ materias, canales, usuarios }) => {
        this.materias = materias;
        this.canales = canales;
        this.usuarios = usuarios;
        this.loadAll();
      },
      error: () => {
        this.materias = [];
        this.canales = [];
        this.usuarios = [];
        this.loadAll();
      },
    });
  }

  actualizar(): void {
    this.loadEtlStatus();
    this.loadDimsAndData();
  }

  aplicarFiltros(): void {
    this.loadAll();
  }

  limpiarFiltros(): void {
    const now = this.limaTodayDate();
    const iso = this.isoWeekParts(now);

    this.filtros.patchValue({
      periodoTipo: 'week',
      year: iso.year,
      month: now.getMonth() + 1,
      week: iso.week,
      start: '',
      end: '',
      view: 'day',

      materia_id: null,
      canal_id: null,
      registrado_por_id: null,
      asesor_id: null,
    });
  }

  setPeriodo(tipo: PeriodoTipo): void {
    const now = this.limaTodayDate();
    const iso = this.isoWeekParts(now);

    if (tipo === 'week') {
      this.filtros.patchValue({
        periodoTipo: 'week',
        year: iso.year,
        week: iso.week,
        view: 'day',
      });
      return;
    }

    if (tipo === 'month') {
      this.filtros.patchValue({
        periodoTipo: 'month',
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        view: 'day',
      });
      return;
    }

    if (tipo === 'year') {
      this.filtros.patchValue({
        periodoTipo: 'year',
        year: now.getFullYear(),
        view: 'month',
      });
      return;
    }

    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.filtros.patchValue({
      periodoTipo: 'range',
      start: this.dateInput(first),
      end: this.dateInput(last),
      view: 'day',
    });
  }

  currentQuery(): VMPeriodQuery {
    const f = this.filtros.getRawValue();

    const periodoTipo = (f.periodoTipo ?? 'week') as PeriodoTipo;
    const view = (f.view ?? 'day') as PeriodView;

    const q: VMPeriodQuery = {
      periodoTipo,
      view,
    };

    if (periodoTipo === 'week') {
      q.year = Number(f.year);
      q.week = Number(f.week);
    }

    if (periodoTipo === 'month') {
      q.year = Number(f.year);
      q.month = Number(f.month);
    }

    if (periodoTipo === 'year') {
      q.year = Number(f.year);
    }

    if (periodoTipo === 'range') {
      q.start = f.start || this.dateInput(this.limaTodayDate());
      q.end = f.end || this.dateInput(this.limaTodayDate());
    }

    if (f.materia_id != null) q.materia_id = Number(f.materia_id);
    if (f.canal_id != null) q.canal_id = Number(f.canal_id);

    if (f.registrado_por_id != null) {
      q.registrado_por_id = Number(f.registrado_por_id);
    }

    if (f.asesor_id != null) {
      q.asesor_id = Number(f.asesor_id);
    }

    return q;
  }

  private loadAll(): void {
    const q = this.currentQuery();
    const meta = this.buildHeaderMeta(q);

    this.periodMain = meta.periodMain;
    this.headerDetail = meta.subtitle;

    this.cancelTimers();

    const myReq = ++this.reqSeq;
    this.loading = true;

    if (!this.firstLoad) {
      this.overlayTimer = setTimeout(() => {
        if (this.reqSeq === myReq) {
          this.showOverlay = true;
          this.overlayShownAt = performance.now();
        }
      }, this.overlayDelay);
    } else {
      this.firstPaintStart = performance.now();
      this.showOverlay = false;
    }

    forkJoin({
      kpis: this.safe(this.svc.kpis(q), this.emptyKpis()),
      linea: this.safe(this.svc.lineaCiudadanos(q), this.emptyLinea()),
      atenciones: this.safe(this.svc.barrasAtenciones(q), this.emptyBarras()),
      donut: this.safe(this.svc.pastelMaterias(q), this.emptyDonut()),
      procesos: this.safe(this.svc.seriesProcesos(q), this.emptySerie('Procesos')),
      tramites: this.safe(this.svc.seriesTramites(q), this.emptySerie('Trámites')),
      audiencias: this.safe(
        this.svc.seriesAudiencias(q),
        this.emptySerie('Audiencias'),
      ),
      otros: this.safe(this.svc.materiasOtros(q), []),
      canalesOtros: this.safe(this.svc.canalesOtros(q), []),
      edades: this.safe(this.svc.ciudadanosEdades(q), []),
    }).subscribe({
      next: (vm) => {
        if (myReq !== this.reqSeq) return;

        this.kpis = vm.kpis;
        this.materiasOtros = vm.otros;
        this.ciudadanosEdades = vm.edades;

        this.construirResumenEdades(vm.edades);
        this.construirConocio(vm.edades);

        this.construirConocioOtros(vm.canalesOtros);

        this.optLine = {
          ...this.optLine,
          series: [
            { name: 'Nuevos', data: vm.linea.nuevos },
            { name: 'Acumulado', data: vm.linea.acumulado },
          ],
          xaxis: { categories: vm.linea.categories },
        };

        this.optAtenciones = {
          ...this.optAtenciones,
          series: vm.atenciones.series,
          xaxis: { categories: vm.atenciones.categories },
        };

        this.optDonut = {
          ...this.optDonut,
          series: vm.donut.series,
          labels: vm.donut.labels,
        };

        this.optProcesos = {
          ...this.optProcesos,
          series: vm.procesos.series,
          xaxis: { categories: vm.procesos.categories },
        };

        this.optTramites = {
          ...this.optTramites,
          series: vm.tramites.series,
          xaxis: { categories: vm.tramites.categories },
        };

        this.optAudiencias = {
          ...this.optAudiencias,
          series: vm.audiencias.series,
          xaxis: { categories: vm.audiencias.categories },
        };

        this.finishLoadingWithOverlayMin();
      },
    });
  }

  private safe<T>(obs: Observable<T>, fallback: T): Observable<T> {
    return obs.pipe(catchError(() => of(fallback)));
  }

  /* ======================================================
     RESÚMENES DERIVADOS
     ====================================================== */

  private construirResumenEdades(rows: VMCiudadanoEdad[]): void {
    const orden = [
      'MENOR DE 18',
      '18-29',
      '30-39',
      '40-49',
      '50-59',
      '60+',
      'SIN DATO',
    ];

    const mapa = new Map<string, number>();

    for (const key of orden) {
      mapa.set(key, 0);
    }

    for (const row of rows ?? []) {
      const rango = (row.rango_edad ?? 'SIN DATO')
        .toUpperCase()
        .trim();

      const final = orden.includes(rango) ? rango : 'SIN DATO';

      mapa.set(final, (mapa.get(final) ?? 0) + 1);
    }

    const total = Array.from(mapa.values()).reduce((acc, n) => acc + n, 0);

    this.totalEdades = total;

    this.edadesResumen = orden.map((rango) => {
      const cantidad = mapa.get(rango) ?? 0;

      return {
        rango,
        cantidad,
        porcentaje: total > 0 ? +((cantidad * 100) / total).toFixed(1) : 0,
      };
    });
  }
  private construirConocio(rows: VMCiudadanoEdad[]): void {
    const mapa = new Map<string, number>();

    for (const row of rows ?? []) {
      const canal = (row.canal ?? 'SIN DATO')
        .toString()
        .trim()
        .toUpperCase();

      const key = canal || 'SIN DATO';

      mapa.set(key, (mapa.get(key) ?? 0) + 1);
    }

    const total = Array.from(mapa.values()).reduce((acc, n) => acc + n, 0);

    this.conocioDetalle = Array.from(mapa.entries())
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        porcentaje: total > 0 ? +((cantidad * 100) / total).toFixed(1) : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    this.optConocio = {
      ...this.optConocio,
      labels: this.conocioDetalle.map((x) => x.nombre),
      series: this.conocioDetalle.map((x) => x.cantidad),
    };

  }
  private construirConocioOtros(
    rows: Array<{ canal: string; cantidad: number }>,
  ): void {
    const total = (rows ?? []).reduce(
      (acc, x) => acc + Number(x.cantidad ?? 0),
      0,
    );

    this.conocioOtrosDetalle = (rows ?? [])
      .map((x) => {
        const cantidad = Number(x.cantidad ?? 0);

        return {
          nombre: x.canal,
          cantidad,
          porcentaje: total > 0
            ? +((cantidad * 100) / total).toFixed(1)
            : 0,
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  /* ======================================================
     ETL
     ====================================================== */

  private loadEtlStatus(): void {
    this.svc.getEtlStatus().subscribe({
      next: (s) => {
        this.etlStatus = s;
        this.etlLabel = this.formatEtlStatus(s);
      },
      error: () => {
        this.etlStatus = null;
        this.etlLabel = '—';
      },
    });
  }

  private formatEtlStatus(s: VMEtlStatus): string {
    const fDT = (iso?: string | null) =>
      iso
        ? new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: this.analyticsTz,
          }).format(new Date(iso))
        : '—';

    const fD = (iso?: string | null) =>
      iso
        ? new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'medium',
            timeZone: this.analyticsTz,
          }).format(new Date(iso))
        : '—';

    if (s.running) {
      return `ETL en curso · run #${s.runId ?? '—'} · desde ${fDT(
        s.runningSince,
      )}`;
    }

    const last = fDT(s.lastRunAt);
    const r0 = fD(s.lastStart);
    const r1 = fD(s.lastEnd);

    return last !== '—'
      ? `Última ETL: ${last} — Rango: ${r0} a ${r1}`
      : 'Última ETL: —';
  }

  actualizarEtl(): void {
    this.runPreset('SMART');
  }

  runPreset(preset: string): void {
    this.svc.runEtlPreset(preset, 'all').subscribe(() => {
      this.loadEtlStatus();
      this.loadAll();
    });
  }

  runFillMissing(): void {
    this.svc.runEtlPreset('MISSING', 'all').subscribe(() => {
      this.loadEtlStatus();
      this.loadAll();
    });
  }

  /* ======================================================
     EXPORTACIÓN
     ====================================================== */

  exportar(): void {
    this.downloadDataset();
  }

  downloadDataset(): void {
    if (this.downloading) return;

    const q = this.currentQuery();
    this.downloading = true;

    this.svc.exportar(q, this.guardarDrive).subscribe({
      next: (response) => {
        const blob = response.body;

        if (!blob) {
          this.downloading = false;
          void this.notify.ok({
            variant: 'warning',
            title: 'No se pudo descargar',
            message: 'El servidor no devolvió el archivo de analíticas.',
            primaryText: 'Aceptar',
          });
          return;
        }

        const filename =
          this.getFilenameFromContentDisposition(
            response.headers.get('content-disposition'),
          ) ??
          `analytics_completo_${this.exportPeriodSlug(q)}.xlsx`;

        this.saveBlob(blob, filename);
        this.downloading = false;

        void this.notifyExportResult(
          response.headers.get('x-drive-save-status'),
          response.headers.get('x-drive-save-message'),
        );
      },
      error: () => {
        this.downloading = false;
        void this.notify.ok({
          variant: 'warning',
          title: 'No se pudo descargar',
          message: 'No se pudo generar el archivo de analíticas.',
          primaryText: 'Aceptar',
        });
      },
    });
  }

  private async notifyExportResult(
    driveStatus: string | null,
    rawDriveMessage: string | null,
  ): Promise<void> {
    if (!this.guardarDrive) {
      await this.notify.ok({
        variant: 'success',
        title: 'Descarga iniciada',
        message: 'El archivo de analíticas se generó correctamente.',
        primaryText: 'Aceptar',
      });
      return;
    }

    if (driveStatus === 'SAVED') {
      await this.notify.ok({
        variant: 'success',
        title: 'Reporte generado',
        message: 'El reporte se descargó y también se guardó en Drive.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const detail = this.decodeDriveMessage(rawDriveMessage);

    await this.notify.ok({
      variant: 'warning',
      title: 'Descarga completada',
      message:
        driveStatus === 'FAILED'
          ? `El reporte se descargó, pero falló el guardado en Drive.${detail ? ` ${detail}` : ''}`
          : 'El reporte se descargó, pero el servidor no confirmó el guardado en Drive.',
      primaryText: 'Aceptar',
    });
  }

  private getFilenameFromContentDisposition(
    value: string | null,
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

  private saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /* ======================================================
     HEADER Y FILTROS
     ====================================================== */

  private buildHeaderMeta(q: VMPeriodQuery): {
    periodMain: string;
    subtitle: string;
  } {
    const range = this.rangeFromQuery(q);

    const fmtDay = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: this.analyticsTz,
    });

    const periodo = this.periodLabel(q);

    const rango = `Rango: ${fmtDay.format(range.start)} – ${fmtDay.format(
      range.end,
    )}`;

    const materia =
      q.materia_id != null
        ? this.materias.find((m) => m.materia_id === q.materia_id)
            ?.materia_nombre ?? `Materia #${q.materia_id}`
        : 'Todas las materias';

    const canal =
      q.canal_id != null
        ? this.canales.find((c) => c.canal_id === q.canal_id)?.canal_nombre ??
          `Canal #${q.canal_id}`
        : 'Todos los canales';

    const registrador =
      q.registrado_por_id != null
        ? this.nombreUsuario(q.registrado_por_id)
        : 'Todos los registradores';

    const asesor =
      q.asesor_id != null
        ? this.nombreUsuario(q.asesor_id)
        : 'Todos los asesores';

    return {
      periodMain: periodo,
      subtitle: `${rango} · Materia: ${materia} · Canal: ${canal} · Registrado por: ${registrador} · Asesor: ${asesor}`,
    };
  }

  private periodLabel(q: VMPeriodQuery): string {
    if (q.periodoTipo === 'week') {
      return `Semana ${q.week} · ${q.year}`;
    }

    if (q.periodoTipo === 'month') {
      const mes = this.months.find((m) => m.value === q.month)?.label ?? q.month;
      return `${mes} · ${q.year}`;
    }

    if (q.periodoTipo === 'year') {
      return `Año ${q.year}`;
    }

    return 'Rango personalizado';
  }

  private rangeFromQuery(q: VMPeriodQuery): { start: Date; end: Date } {
    if (q.periodoTipo === 'week') {
      const start = this.mondayOfIsoWeek(q.year!, q.week!);
      const end = new Date(start);

      end.setDate(start.getDate() + 6);

      return { start, end };
    }

    if (q.periodoTipo === 'month') {
      const start = new Date(q.year!, (q.month ?? 1) - 1, 1);
      const end = new Date(q.year!, q.month ?? 1, 0);

      return { start, end };
    }

    if (q.periodoTipo === 'year') {
      return {
        start: new Date(q.year!, 0, 1),
        end: new Date(q.year!, 11, 31),
      };
    }

    return {
      start: q.start ? new Date(q.start) : new Date(),
      end: q.end ? new Date(q.end) : new Date(),
    };
  }

  private nombreUsuario(id: number): string {
    const u = this.usuarios.find((x) => x.us_id === id);

    return u ? `${u.nombres} ${u.apellidos}`.trim() : `Usuario #${id}`;
  }

  /* ======================================================
     OPCIONES APEX
     ====================================================== */

  private makeLineOptions(height: number): ChartOptionsLine {
    return {
      series: [],
      chart: {
        type: 'line',
        height,
        toolbar: { show: true },
        zoom: { enabled: false },
        animations: { enabled: false },
      },
      xaxis: { categories: [] },
      dataLabels: {
        enabled: true,
        formatter: (value: number) => String(Math.round(Number(value ?? 0))),
        style: {
          fontSize: '10px',
          fontWeight: 600,
        },
        background: {
          enabled: true,
          borderRadius: 4,
          opacity: 0.75,
        },
      },
      stroke: { curve: 'smooth', width: 3 },
      legend: { position: 'top' },
      tooltip: { shared: true, intersect: false },
    };
  }

  private makeStackedBarOptions(height: number): ChartOptionsBar {
    return {
      series: [],
      chart: {
        type: 'bar',
        height,
        stacked: true,
        toolbar: { show: true },
        animations: { enabled: false },
      },
      xaxis: { categories: [] },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '11px',
                fontWeight: 600,
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value: number) => {
          const n = Number(value ?? 0);
          return n > 0 ? String(Math.round(n)) : '';
        },
        style: {
          fontSize: '10px',
          fontWeight: 600,
        },
      },
      legend: { position: 'top' },
      tooltip: { shared: true, intersect: false },
    };
  }

  private makeSimpleBarOptions(height: number): ChartOptionsBar {
    return {
      series: [],
      chart: {
        type: 'bar',
        height,
        toolbar: { show: true },
        animations: { enabled: false },
      },
      xaxis: { categories: [] },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value: number) => {
          const n = Number(value ?? 0);
          return n > 0 ? String(Math.round(n)) : '';
        },
        style: {
          fontSize: '10px',
          fontWeight: 600,
        },
      },
      legend: { position: 'top' },
      tooltip: { shared: true, intersect: false },
    };
  }

  private makeDonutOptions(height: number): ChartOptionsDonut {
    return {
      series: [],
      chart: {
        type: 'donut',
        height,
        toolbar: { show: true },
        animations: { enabled: false },
      },
      labels: [],
      legend: {
        position: 'bottom',
        fontSize: '12px',
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts: any) => {
          const series = opts?.w?.config?.series ?? [];
          const current = Number(series?.[opts.seriesIndex] ?? 0);

          if (current <= 0) return '';

          return `${current} (${Number(val ?? 0).toFixed(1)}%)`;
        },
        style: {
          fontSize: '10px',
          fontWeight: 600,
        },
        dropShadow: {
          enabled: false,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '62%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: (w: any) => {
                  const total = (w?.globals?.seriesTotals ?? []).reduce(
                    (acc: number, n: number) => acc + Number(n ?? 0),
                    0,
                  );

                  return String(total);
                },
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number, opts: any) => {
            const series = opts?.w?.config?.series ?? [];
            const total = series.reduce(
              (acc: number, n: number) => acc + Number(n ?? 0),
              0,
            );

            const pct = total > 0 ? (Number(value ?? 0) * 100) / total : 0;

            return `${value} (${pct.toFixed(1)}%)`;
          },
        },
      },
    };
  }

  /* ======================================================
     LOADING
     ====================================================== */

  private finishLoadingWithOverlayMin(): void {
    const complete = () => {
      this.loading = false;
      clearTimeout(this.overlayTimer);

      if (this.showOverlay) {
        const elapsed = performance.now() - this.overlayShownAt;
        const remain = Math.max(0, this.minOverlayMs - elapsed);

        setTimeout(() => {
          this.showOverlay = false;
          this.firstLoad = false;
        }, remain);
      } else {
        this.showOverlay = false;
        this.firstLoad = false;
      }
    };

    if (this.firstLoad) {
      const elapsed = performance.now() - this.firstPaintStart;
      const remain = Math.max(0, this.firstSkeletonMinMs - elapsed);
      setTimeout(complete, remain);
    } else {
      complete();
    }
  }

  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
  }

  /* ======================================================
     VACÍOS
     ====================================================== */

  private emptyKpis(): VMKpis {
    return {
      nuevos_ciudadanos: 0,
      consultas: 0,
      seguimientos: 0,
      atenciones: 0,
      procesos: 0,
      tramites: 0,
      audiencias: 0,
      promedio_consultas_por_ciudadano: 0,
      seguimientos_por_consulta: 0,
    };
  }

  private emptyLinea(): VMLineaCiudadanos {
    return {
      categories: [],
      nuevos: [],
      acumulado: [],
    };
  }

  private emptyBarras(): VMBarrasApiladas {
    return {
      categories: [],
      series: [
        { name: 'Consultas', data: [] },
        { name: 'Seguimientos', data: [] },
      ],
    };
  }

  private emptyDonut(): VMPastelMaterias {
    return {
      labels: [],
      series: [],
    };
  }

  private emptySerie(name: string): VMSerieSimple {
    return {
      categories: [],
      series: [{ name, data: [] }],
    };
  }

  /* ======================================================
     FECHAS
     ====================================================== */

  private limaTodayDate(): Date {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: this.analyticsTz,
    }).format(new Date());

    const [y, m, d] = parts.split('-').map(Number);

    return new Date(y, m - 1, d);
  }

  private dateInput(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
  }

  private buildYears(): number[] {
    const current = this.limaTodayDate().getFullYear();
    const years: number[] = [];

    for (let y = current; y >= 2020; y--) {
      years.push(y);
    }

    return years;
  }

  private isoWeekParts(date: Date): { year: number; week: number } {
    const d = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ),
    );

    const dayNum = d.getUTCDay() || 7;

    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const year = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));

    const week = Math.ceil(
      (((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7),
    );

    return { year, week };
  }

  private mondayOfIsoWeek(year: number, week: number): Date {
    const jan4 = new Date(year, 0, 4);
    const day = jan4.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() + diff);

    const result = new Date(week1Monday);
    result.setDate(week1Monday.getDate() + (week - 1) * 7);

    return result;
  }

  private exportPeriodSlug(q: VMPeriodQuery): string {
    if (q.periodoTipo === 'week') return `${q.year}_semana_${q.week}`;
    if (q.periodoTipo === 'month') return `${q.year}_${q.month}`;
    if (q.periodoTipo === 'year') return `${q.year}`;

    return `${q.start ?? 'inicio'}_${q.end ?? 'fin'}`;
  }
}