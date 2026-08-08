// src/app/pages/audiencia/audiencia.calendario/audiencia.calendario.ts

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AudienciaService } from '../services/audiencia.service';
import {VMAudienciaCalendarioItem,VMAudienciaCalendarioSemana,} from '../models/audiencia.vm';

import { PageMetaService } from '@/app/services/page_meta.service';

interface DiaCalendario {
  ymd: string;
  label: string;
  dia: string;
}

@Component({
  selector: 'app-audiencia-calendario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './audiencia.calendario.html',
  styleUrl: './audiencia.calendario.css',
})
export class AudienciaCalendario implements OnInit, OnDestroy {
  private service = inject(AudienciaService);
  private pageMeta = inject(PageMetaService);

  private readonly tz = 'America/Lima';

  readonly dayStartHour = 6;
  readonly dayEndHour = 24;
  readonly pxPerMinute = 1.35;

  activeWeekStart = '';
  activeWeekEnd = '';
  todayYmd = '';

  dias: DiaCalendario[] = [];
  items: VMAudienciaCalendarioItem[] = [];
  selected: VMAudienciaCalendarioItem | null = null;

  loading = false;
  firstLoad = true;

  nowTopPx: number | null = null;

  private cache = new Map<string, VMAudienciaCalendarioSemana>();
  private eventsByDay: Record<string, VMAudienciaCalendarioItem[]> = {};
  private nowTimer: any;

  get calendarHeightPx(): number {
    return (this.dayEndHour - this.dayStartHour) * 60 * this.pxPerMinute;
  }

  get hourHeightPx(): number {
    return 60 * this.pxPerMinute;
  }

  get hours(): number[] {
    return Array.from(
      { length: this.dayEndHour - this.dayStartHour + 1 },
      (_, i) => this.dayStartHour + i,
    );
  }

  get semanaTexto(): string {
    if (!this.activeWeekStart || !this.activeWeekEnd) return 'Semana';
    return `Del ${this.formatYmdDiaMes(this.activeWeekStart)} al ${this.formatYmdDiaMes(this.activeWeekEnd)}`;
  }

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Audiencias',
    });

    this.todayYmd = this.currentPeruYmd();
    this.activeWeekStart = this.weekStartYmd(this.todayYmd);
    this.activeWeekEnd = this.addDaysYmd(this.activeWeekStart, 6);
    this.rebuildDias();

    this.loadInitialWeeks();

    this.updateNowLine();
    this.nowTimer = setInterval(() => this.updateNowLine(), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.nowTimer);
    this.pageMeta.clear();
  }

  async goToday(): Promise<void> {
    this.todayYmd = this.currentPeruYmd();
    this.activeWeekStart = this.weekStartYmd(this.todayYmd);
    this.activeWeekEnd = this.addDaysYmd(this.activeWeekStart, 6);
    this.rebuildDias();
    this.selected = null;

    await this.loadInitialWeeks();
    this.updateNowLine();
  }

  async goWeek(delta: number): Promise<void> {
    const nextWeek = this.addDaysYmd(this.activeWeekStart, delta * 7);

    this.activeWeekStart = nextWeek;
    this.activeWeekEnd = this.addDaysYmd(nextWeek, 6);
    this.rebuildDias();
    this.selected = null;

    await this.loadWeekIfNeeded(nextWeek);
    this.rebuildItems();
    this.updateNowLine();
  }

  selectAudiencia(item: VMAudienciaCalendarioItem): void {
    this.selected = item;
  }

  closeSelected(): void {
    this.selected = null;
  }

  eventosDia(ymd: string): VMAudienciaCalendarioItem[] {
    return this.eventsByDay[ymd] ?? [];
  }

  isToday(day: DiaCalendario): boolean {
    return day.ymd === this.todayYmd;
  }

  isSelected(item: VMAudienciaCalendarioItem): boolean {
    return this.selected?.id === item.id;
  }

  eventTopPx(item: VMAudienciaCalendarioItem): number {
    const start = this.minutesOfDay(item.fechaHoraInicio);
    const min = Math.max(this.dayStartHour * 60, start);
    return (min - this.dayStartHour * 60) * this.pxPerMinute;
  }

  eventHeightPx(item: VMAudienciaCalendarioItem): number {
    const start = this.minutesOfDay(item.fechaHoraInicio);
    const end = this.eventEndMinutes(item);

    const visibleStart = Math.max(this.dayStartHour * 60, start);
    const visibleEnd = Math.min(this.dayEndHour * 60, end);

    const minutes = Math.max(20, visibleEnd - visibleStart);
    return Math.max(32, minutes * this.pxPerMinute);
  }

  hourTopPx(hour: number): number {
    return (hour - this.dayStartHour) * 60 * this.pxPerMinute;
  }

  hourLabel(hour: number): string {
    if (hour === 24) return '12 a. m.';
    if (hour === 12) return '12 p. m.';

    const suffix = hour < 12 ? 'a. m.' : 'p. m.';
    const h = hour <= 12 ? hour : hour - 12;

    return `${String(h).padStart(2, '0')} ${suffix}`;
  }

  timeRange(item: VMAudienciaCalendarioItem): string {
    const inicio = this.formatHoraPeru(item.fechaHoraInicio);
    const fin = item.fechaHoraFin ? this.formatHoraPeru(item.fechaHoraFin) : null;

    return fin ? `${inicio} - ${fin}` : inicio;
  }

  fechaHoraExtendida(item: VMAudienciaCalendarioItem): string {
    const fecha = new Intl.DateTimeFormat('es-PE', {
      timeZone: this.tz,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(item.fechaHoraInicio));

    return `${this.capitalize(fecha)} de ${this.timeRange(item)}`;
  }

  tituloAudiencia(item: VMAudienciaCalendarioItem): string {
    return item.titulo || 'Audiencia';
  }

  private async loadInitialWeeks(): Promise<void> {
    const fechas = [-14, -7, 0, 7, 14].map(d =>
      this.addDaysYmd(this.activeWeekStart, d),
    );

    this.loading = true;

    try {
      await Promise.all(fechas.map(f => this.loadWeekIfNeeded(f)));
      this.rebuildItems();
    } finally {
      this.loading = false;
      this.firstLoad = false;
    }
  }

  private async loadWeekIfNeeded(fecha: string): Promise<void> {
    const weekStart = this.weekStartYmd(fecha);

    if (this.cache.has(weekStart)) return;

    const data = await firstValueFrom(
      this.service.calendarioSemana({ fecha: weekStart }),
    );

    this.cache.set(data.semanaInicio, data);
  }

  private rebuildItems(): void {
    const semana = this.cache.get(this.activeWeekStart);
    const items = semana?.items ?? [];

    this.items = items;

    const grouped: Record<string, VMAudienciaCalendarioItem[]> = {};

    for (const d of this.dias) {
      grouped[d.ymd] = [];
    }

    for (const item of items) {
      const ymd = this.peruParts(item.fechaHoraInicio).ymd;

      if (grouped[ymd]) {
        grouped[ymd].push(item);
      }
    }

    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) =>
        new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime(),
      );
    }

    this.eventsByDay = grouped;
  }

  private rebuildDias(): void {
    this.dias = Array.from({ length: 7 }, (_, i) => {
      const ymd = this.addDaysYmd(this.activeWeekStart, i);

      return {
        ymd,
        dia: this.formatYmdDiaCorto(ymd),
        label: this.formatYmdDiaMesCorto(ymd),
      };
    });
  }

  private updateNowLine(): void {
    this.todayYmd = this.currentPeruYmd();

    if (this.todayYmd < this.activeWeekStart || this.todayYmd > this.activeWeekEnd) {
      this.nowTopPx = null;
      return;
    }

    const now = this.peruParts(new Date());
    const minutes = now.hour * 60 + now.minute;

    if (minutes < this.dayStartHour * 60 || minutes > this.dayEndHour * 60) {
      this.nowTopPx = null;
      return;
    }

    this.nowTopPx = (minutes - this.dayStartHour * 60) * this.pxPerMinute;
  }

  private eventEndMinutes(item: VMAudienciaCalendarioItem): number {
    const start = this.minutesOfDay(item.fechaHoraInicio);

    if (!item.fechaHoraFin) {
      return start + 45;
    }

    const startYmd = this.peruParts(item.fechaHoraInicio).ymd;
    const endParts = this.peruParts(item.fechaHoraFin);

    if (endParts.ymd !== startYmd) {
      return this.dayEndHour * 60;
    }

    const end = endParts.hour * 60 + endParts.minute;

    return end > start ? end : start + 45;
  }

  private minutesOfDay(value: Date | string | null | undefined): number {
    const p = this.peruParts(value);
    return p.hour * 60 + p.minute;
  }

  private peruParts(value: Date | string | null | undefined): {
    ymd: string;
    hour: number;
    minute: number;
  } {
    const date = value instanceof Date ? value : new Date(value ?? '');

    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const get = (type: string) =>
      parts.find(p => p.type === type)?.value ?? '';

    const year = get('year');
    const month = get('month');
    const day = get('day');

    let hour = Number(get('hour'));
    const minute = Number(get('minute'));

    if (hour === 24) hour = 0;

    return {
      ymd: `${year}-${month}-${day}`,
      hour: Number.isFinite(hour) ? hour : 0,
      minute: Number.isFinite(minute) ? minute : 0,
    };
  }

  private currentPeruYmd(): string {
    return this.peruParts(new Date()).ymd;
  }

  private weekStartYmd(ymd: string): string {
    const d = this.ymdToUtcDate(ymd);
    const day = d.getUTCDay();
    const diffToMonday = (day + 6) % 7;

    return this.addDaysYmd(ymd, -diffToMonday);
  }

  private addDaysYmd(ymd: string, days: number): string {
    const d = this.ymdToUtcDate(ymd);
    d.setUTCDate(d.getUTCDate() + days);

    return d.toISOString().slice(0, 10);
  }

  private ymdToUtcDate(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }

  private formatYmdDiaCorto(ymd: string): string {
    const d = this.ymdToUtcDate(ymd);

    const text = new Intl.DateTimeFormat('es-PE', {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(d);

    return this.capitalize(text.replace('.', ''));
  }

  private formatYmdDiaMesCorto(ymd: string): string {
    const d = this.ymdToUtcDate(ymd);

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
    }).format(d);
  }

  private formatYmdDiaMes(ymd: string): string {
    const d = this.ymdToUtcDate(ymd);

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      timeZone: 'UTC',
    }).format(d);
  }

  private formatHoraPeru(value: Date | string | null | undefined): string {
    if (!value) return '—';

    return new Intl.DateTimeFormat('es-PE', {
      timeZone: this.tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(value));
  }

  private capitalize(value: string): string {
    const v = (value ?? '').trim();
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
  }
}