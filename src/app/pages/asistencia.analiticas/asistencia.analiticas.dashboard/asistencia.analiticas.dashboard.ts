import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import {
  Subscription,
  catchError,
  forkJoin,
  of,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';
import {
  AsistenciaPeriodoTipo,
  AsistenciaTablaSegmento,
  AsistenciaView,
  VMAsistenciaDashboard,
  VMAsistenciaDimUsuario,
  VMAsistenciaEtlStatus,
  VMAsistenciaPeriodoPage,
  VMAsistenciaQuery,
} from '../models/asistencia.analiticas.vm';
import {
  AsistenciasDashboardService,
} from '../services/asistencia.analiticas.service';

type ChartOptionsBar = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-asistencias-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgApexchartsModule,
  ],
  templateUrl:
    './asistencia.analiticas.dashboard.html',
  styleUrls: [
    './asistencia.analiticas.dashboard.css',
  ],
})
export class AsistenciasDashboard
  implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly svc =
    inject(AsistenciasDashboardService);
  private readonly pageMeta =
    inject(PageMetaService);
  private readonly notify =
    inject(NotificacionesService);

  private readonly analyticsTz = 'America/Lima';
  private readonly hoy = this.limaTodayCalendar();
  private readonly isoActual =
    this.isoWeekParts(this.hoy);

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

  filtros = this.fb.group({
    periodoTipo: [
      'week' as AsistenciaPeriodoTipo,
    ],
    year: [this.isoActual.year],
    month: [this.hoy.getUTCMonth() + 1],
    week: [this.isoActual.week],
    start: [''],
    end: [''],
    view: ['day' as AsistenciaView],
    usId: [null as number | null],
  });

  dashboard: VMAsistenciaDashboard | null = null;
  periodo: VMAsistenciaPeriodoPage | null = null;
  usuarios: VMAsistenciaDimUsuario[] = [];
  etlStatus: VMAsistenciaEtlStatus | null = null;

  periodMain = '';
  headerDetail = '';
  etlLabel = 'ETL: —';

  loadingDashboard = false;
  loadingPeriodo = false;
  loadingEtl = false;
  downloading = false;
  guardarDrive = false;
  firstLoad = true;

  tablaSegmento:
    AsistenciaTablaSegmento = 'all';
  page = 1;
  pageSize = 10;

  @ViewChild('chartBar')
  chartBar?: ChartComponent;

  optBar: ChartOptionsBar = {
    series: [],
    chart: {
      type: 'bar',
      height: 330,
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
      formatter: (value: number) =>
        Number(value ?? 0) > 0
          ? String(Math.round(Number(value)))
          : '',
      style: {
        fontSize: '10px',
        fontWeight: 600,
      },
    },
    legend: { position: 'top' },
    tooltip: {
      shared: true,
      intersect: false,
    },
    title: {
      text: 'Asistencia por día',
      align: 'left',
    },
  };

  private sub?: Subscription;

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Analíticas de asistencia',
    });

    this.loadInitial();

    this.sub = this.filtros.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(
          (a, b) =>
            JSON.stringify(a) === JSON.stringify(b),
        ),
      )
      .subscribe(() => this.loadAll(true));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.pageMeta.clear();
  }

  get periodoTipo(): AsistenciaPeriodoTipo {
    return (
      this.filtros.controls.periodoTipo.value ??
      'week'
    ) as AsistenciaPeriodoTipo;
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

  get isRange(): boolean {
    return this.periodoTipo === 'range';
  }

  get cards() {
    return this.dashboard?.cards ?? null;
  }

  get estadoRows() {
    return this.periodo?.items ?? [];
  }

  get countHoy(): number {
    return (
      this.periodo?.countHoy ??
      this.dashboard?.countHoy ??
      0
    );
  }

  get countAnteriores(): number {
    return (
      this.periodo?.countAnteriores ??
      this.dashboard?.countAnteriores ??
      0
    );
  }

  get countProximos(): number {
    return (
      this.periodo?.countProximos ??
      this.dashboard?.countProximos ??
      0
    );
  }

  get countTodos(): number {
    return (
      this.countHoy +
      this.countAnteriores +
      this.countProximos
    );
  }

  get estadoTotal(): number {
    return this.periodo?.total ?? 0;
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.estadoTotal / this.pageSize),
    );
  }

  get pageFrom(): number {
    return this.estadoTotal
      ? (this.page - 1) * this.pageSize + 1
      : 0;
  }

  get pageTo(): number {
    return Math.min(
      this.estadoTotal,
      this.page * this.pageSize,
    );
  }

  setPeriodo(
    tipo: AsistenciaPeriodoTipo,
  ): void {
    const now = this.limaTodayCalendar();
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
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
        view: 'day',
      });
      return;
    }

    if (tipo === 'year') {
      this.filtros.patchValue({
        periodoTipo: 'year',
        year: now.getUTCFullYear(),
        view: 'month',
      });
      return;
    }

    const first = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
      ),
    );
    const last = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        0,
      ),
    );

    this.filtros.patchValue({
      periodoTipo: 'range',
      start: this.toYmd(first),
      end: this.toYmd(last),
      view: 'day',
    });
  }

  actualizar(): void {
    this.loadEtlStatus();
    this.loadAll(false);
  }

  setSegment(
    segment: AsistenciaTablaSegmento,
  ): void {
    this.tablaSegmento = segment;
    this.page = 1;
    this.loadPeriodo();
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.loadPeriodo();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page--;
    this.loadPeriodo();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) return;
    this.page++;
    this.loadPeriodo();
  }

  runPreset(
    preset:
      | 'TODAY'
      | 'WEEK_THIS'
      | 'WEEK_LAST'
      | 'MONTH_THIS'
      | 'MONTH_LAST'
      | 'YEAR_THIS'
      | 'YEAR_LAST'
      | 'SMART',
  ): void {
    if (this.loadingEtl) return;

    this.loadingEtl = true;

    this.svc.runEtlPreset(preset).subscribe({
      next: () => {
        this.loadingEtl = false;
        this.loadEtlStatus();
        this.loadAll(false);
      },
      error: () => {
        this.loadingEtl = false;
      },
    });
  }

  descargarTodoPeriodo(): void {
    if (
      !this.dashboard ||
      this.downloading
    ) {
      return;
    }

    this.downloading = true;

    this.svc
      .exportar(this.currentQuery(), this.guardarDrive)
      .subscribe({
        next: (response) => {
          const blob = response.body as Blob;
          const contentDisposition =
            response.headers.get(
              'content-disposition',
            ) ?? '';
          const match =
            /filename="?([^";]+)"?/i.exec(
              contentDisposition,
            );
          const filename =
            match?.[1] ??
            `asistencia_${this.dashboard!.fechaDesde}_${this.dashboard!.fechaHasta}.xlsx`;

          const url = URL.createObjectURL(blob);
          const link =
            document.createElement('a');

          link.href = url;
          link.download = filename;
          link.click();

          URL.revokeObjectURL(url);
          this.downloading = false;

          const driveStatus = response.headers.get('x-drive-save-status');
          if (driveStatus === 'SAVED') {
            void this.notify.ok({
              variant: 'success',
              title: 'Reporte generado',
              message: 'El reporte se descargó y también se guardó en Drive.',
              primaryText: 'Aceptar',
            });
          } else if (driveStatus === 'FAILED') {
            const raw = response.headers.get('x-drive-save-message') ?? '';
            let detail = 'No se pudo guardar el reporte en Drive.';
            try { detail = decodeURIComponent(raw) || detail; } catch {}
            void this.notify.ok({
              variant: 'warning',
              title: 'Descarga completada',
              message: `El reporte se descargó, pero falló el guardado en Drive. ${detail}`,
              primaryText: 'Aceptar',
            });
          }
        },
        error: () => {
          this.downloading = false;
        },
      });
  }

  private loadInitial(): void {
    forkJoin({
      usuarios: this.svc
        .getDimUsuarios()
        .pipe(catchError(() => of([]))),
      status: this.svc
        .getEtlStatus()
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ usuarios, status }) => {
        this.usuarios = usuarios;
        this.applyEtlStatus(status);
        this.loadAll(true);
      },
      error: () => {
        this.usuarios = [];
        this.applyEtlStatus(null);
        this.loadAll(true);
      },
    });
  }

  private currentQuery():
    VMAsistenciaQuery {
    const form = this.filtros.getRawValue();

    const periodoTipo =
      (form.periodoTipo ??
        'week') as AsistenciaPeriodoTipo;
    const view =
      (form.view ?? 'day') as AsistenciaView;

    const query: VMAsistenciaQuery = {
      periodoTipo,
      view,
      usId: form.usId ?? null,
    };

    if (periodoTipo === 'week') {
      query.year = Number(form.year);
      query.week = Number(form.week);
    }

    if (periodoTipo === 'month') {
      query.year = Number(form.year);
      query.month = Number(form.month);
    }

    if (periodoTipo === 'year') {
      query.year = Number(form.year);
    }

    if (periodoTipo === 'range') {
      const today = this.toYmd(
        this.limaTodayCalendar(),
      );

      query.start = form.start || today;
      query.end = form.end || today;
    }

    return query;
  }

  private loadAll(
    resetTable: boolean,
  ): void {
    const query = this.currentQuery();
    const header =
      this.buildHeaderMeta(query);

    this.periodMain = header.periodMain;
    this.headerDetail = header.subtitle;

    if (resetTable) {
      this.tablaSegmento = 'all';
      this.page = 1;
      this.pageSize = 10;
    }

    this.loadingDashboard = true;
    this.loadingPeriodo = true;

    forkJoin({
      dashboard:
        this.svc.getDashboard(query),
      page: this.svc.getPeriodoPage(
        query,
        this.tablaSegmento,
        this.page,
        this.pageSize,
      ),
    }).subscribe({
      next: ({ dashboard, page }) => {
        this.dashboard = dashboard;
        this.periodo = page;
        this.page = page.page;
        this.pageSize = page.pageSize;

        this.optBar = {
          ...this.optBar,
          series: dashboard.barras.series,
          xaxis: {
            categories:
              dashboard.barras.categories,
          },
          title: {
            ...this.optBar.title,
            text:
              dashboard.barras.granularity ===
              'MONTH'
                ? 'Asistencia por mes'
                : 'Asistencia por día',
          },
        };

        this.loadingDashboard = false;
        this.loadingPeriodo = false;
        this.firstLoad = false;
      },
      error: () => {
        this.loadingDashboard = false;
        this.loadingPeriodo = false;
        this.firstLoad = false;
      },
    });
  }

  private loadPeriodo(): void {
    this.loadingPeriodo = true;

    this.svc
      .getPeriodoPage(
        this.currentQuery(),
        this.tablaSegmento,
        this.page,
        this.pageSize,
      )
      .subscribe({
        next: (page) => {
          this.periodo = page;
          this.page = page.page;
          this.pageSize = page.pageSize;
          this.loadingPeriodo = false;
        },
        error: () => {
          this.loadingPeriodo = false;
        },
      });
  }

  private loadEtlStatus(): void {
    this.svc.getEtlStatus().subscribe({
      next: (status) =>
        this.applyEtlStatus(status),
      error: () =>
        this.applyEtlStatus(null),
    });
  }

  private applyEtlStatus(
    status: VMAsistenciaEtlStatus | null,
  ): void {
    this.etlStatus = status;
    this.etlLabel = status
      ? this.formatEtlStatus(status)
      : 'ETL: —';
  }

  private formatEtlStatus(
    status: VMAsistenciaEtlStatus,
  ): string {
    if (status.running) {
      return (
        `ETL en curso · ejecución #` +
        `${status.runId ?? '—'}`
      );
    }

    const last = status.lastRunAt
      ? new Intl.DateTimeFormat('es-PE', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: this.analyticsTz,
        }).format(
          new Date(status.lastRunAt),
        )
      : '—';

    return `Última ETL: ${last}`;
  }

  private buildHeaderMeta(
    query: VMAsistenciaQuery,
  ): {
    periodMain: string;
    subtitle: string;
  } {
    const range =
      this.rangeFromQuery(query);
    const formatter =
      new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });

    const usuario =
      query.usId != null
        ? this.nombreUsuario(query.usId)
        : 'Todos los usuarios';

    return {
      periodMain:
        this.periodLabel(query),
      subtitle:
        `Rango: ${formatter.format(range.start)}` +
        ` – ${formatter.format(range.end)}` +
        ` · Usuario: ${usuario}`,
    };
  }

  private periodLabel(
    query: VMAsistenciaQuery,
  ): string {
    if (
      query.periodoTipo === 'week'
    ) {
      return (
        `Semana ${query.week}` +
        ` · ${query.year}`
      );
    }

    if (
      query.periodoTipo === 'month'
    ) {
      const month =
        this.months.find(
          (item) =>
            item.value === query.month,
        )?.label ?? query.month;

      return `${month} · ${query.year}`;
    }

    if (
      query.periodoTipo === 'year'
    ) {
      return `Año ${query.year}`;
    }

    return 'Rango personalizado';
  }

  private rangeFromQuery(
    query: VMAsistenciaQuery,
  ): {
    start: Date;
    end: Date;
  } {
    if (
      query.periodoTipo === 'week'
    ) {
      const start =
        this.mondayOfIsoWeek(
          query.year!,
          query.week!,
        );
      const end = new Date(start);

      end.setUTCDate(
        end.getUTCDate() + 6,
      );

      return { start, end };
    }

    if (
      query.periodoTipo === 'month'
    ) {
      return {
        start: new Date(
          Date.UTC(
            query.year!,
            (query.month ?? 1) - 1,
            1,
          ),
        ),
        end: new Date(
          Date.UTC(
            query.year!,
            query.month ?? 1,
            0,
          ),
        ),
      };
    }

    if (
      query.periodoTipo === 'year'
    ) {
      return {
        start: new Date(
          Date.UTC(query.year!, 0, 1),
        ),
        end: new Date(
          Date.UTC(query.year!, 11, 31),
        ),
      };
    }

    return {
      start: this.calendarDate(
        query.start,
      ),
      end: this.calendarDate(
        query.end,
      ),
    };
  }

  private nombreUsuario(
    id: number,
  ): string {
    return (
      this.usuarios.find(
        (user) => user.usId === id,
      )?.nombre ?? `Usuario #${id}`
    );
  }

  private limaTodayCalendar():
    Date {
    const parts =
      new Intl.DateTimeFormat('en-CA', {
        timeZone: this.analyticsTz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date());

    const read = (type: string) =>
      Number(
        parts.find(
          (part) => part.type === type,
        )?.value ?? 0,
      );

    return new Date(
      Date.UTC(
        read('year'),
        read('month') - 1,
        read('day'),
      ),
    );
  }

  private calendarDate(
    ymd?: string,
  ): Date {
    if (
      ymd &&
      /^\d{4}-\d{2}-\d{2}$/.test(ymd)
    ) {
      const [year, month, day] =
        ymd.split('-').map(Number);

      return new Date(
        Date.UTC(
          year,
          month - 1,
          day,
        ),
      );
    }

    return this.limaTodayCalendar();
  }

  private toYmd(
    date: Date,
  ): string {
    return date.toISOString().slice(0, 10);
  }

  private buildYears(): number[] {
    const current =
      this.hoy.getUTCFullYear();
    const years: number[] = [];

    for (
      let year = current;
      year >= 2020;
      year--
    ) {
      years.push(year);
    }

    return years;
  }

  private isoWeekParts(
    date: Date,
  ): {
    year: number;
    week: number;
  } {
    const value = new Date(date);
    const day = value.getUTCDay() || 7;

    value.setUTCDate(
      value.getUTCDate() + 4 - day,
    );

    const year =
      value.getUTCFullYear();
    const yearStart = new Date(
      Date.UTC(year, 0, 1),
    );
    const week = Math.ceil(
      (
        (
          value.getTime() -
          yearStart.getTime()
        ) /
          86_400_000 +
        1
      ) / 7,
    );

    return { year, week };
  }

  private mondayOfIsoWeek(
    year: number,
    week: number,
  ): Date {
    const januaryFourth = new Date(
      Date.UTC(year, 0, 4),
    );
    const day =
      januaryFourth.getUTCDay() || 7;
    const weekOneMonday =
      new Date(januaryFourth);

    weekOneMonday.setUTCDate(
      januaryFourth.getUTCDate() -
        day +
        1,
    );

    const result =
      new Date(weekOneMonday);

    result.setUTCDate(
      result.getUTCDate() +
        (week - 1) * 7,
    );

    return result;
  }
}
