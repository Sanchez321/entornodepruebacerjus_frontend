import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter, fromEvent, interval } from 'rxjs';

import { AuthService } from '@/app/auth/auth.service';
import { ApiNotificacionSistemaItem } from '@/app/components/notificaciones-sistema/models/notificacion-sistema.api';
import { NotificacionSistemaService } from '@/app/components/notificaciones-sistema/services/notificacion-sistema.service';
import { PageMeta, PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly metaSvc = inject(PageMetaService);
  private readonly notifications = inject(NotificacionSistemaService);

  title = '';
  backLink: string | any[] | null = null;

  notificationItems: ApiNotificacionSistemaItem[] = [];
  unreadCount = 0;
  notificationOpen = false;
  notificationLoading = false;

  private readonly subscriptions = new Subscription();
  private lastNotificationFetch = 0;

  constructor() {
    this.subscriptions.add(
      this.metaSvc.meta$.subscribe((meta) => this.applyMeta(meta)),
    );
  }

  ngOnInit(): void {
    this.refreshNotifications(true);

    this.subscriptions.add(
      interval(10 * 60_000).subscribe(() => this.refreshNotifications(true)),
    );

    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          if (Date.now() - this.lastNotificationFetch >= 2 * 60_000) {
            this.refreshNotifications(false);
          }
        }),
    );

    this.subscriptions.add(
      fromEvent(document, 'visibilitychange').subscribe(() => {
        if (
          document.visibilityState === 'visible' &&
          Date.now() - this.lastNotificationFetch >= 30_000
        ) {
          this.refreshNotifications(false);
        }
      }),
    );

    this.subscriptions.add(
      fromEvent(window, 'focus').subscribe(() => {
        if (Date.now() - this.lastNotificationFetch >= 30_000) {
          this.refreshNotifications(false);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click')
  closeNotificationMenu(): void {
    this.notificationOpen = false;
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goBack(): void {
    if (Array.isArray(this.backLink)) {
      this.router.navigate(this.backLink);
    } else if (typeof this.backLink === 'string') {
      this.router.navigateByUrl(this.backLink);
    } else {
      window.history.back();
    }
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationOpen = !this.notificationOpen;

    if (this.notificationOpen && this.unreadCount > 0) {
      this.notificationItems = this.notificationItems.map((item) => ({
        ...item,
        leida: true,
      }));
      this.unreadCount = 0;
      this.notifications.marcarTodasLeidas().subscribe({
        error: () => this.refreshNotifications(true),
      });
    }
  }

  keepNotificationMenuOpen(event: MouseEvent): void {
    event.stopPropagation();
  }

  descartarNotification(
    event: MouseEvent,
    item: ApiNotificacionSistemaItem,
  ): void {
    event.stopPropagation();
    this.notificationItems = this.notificationItems.filter(
      (current) => current.id !== item.id,
    );

    this.notifications.descartar(item.id).subscribe({
      error: () => this.refreshNotifications(true),
    });
  }

  trackNotification(_index: number, item: ApiNotificacionSistemaItem): number {
    return item.id;
  }

  fechaNotificacion(item: ApiNotificacionSistemaItem): string {
    const value = item.fecha_evento ?? item.creado_en;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Lima',
    }).format(date);
  }

  private refreshNotifications(showLoading: boolean): void {
    if (this.notificationLoading) return;
    this.notificationLoading = showLoading;

    this.notifications.getMias(20).subscribe({
      next: (response) => {
        this.notificationItems = response.items ?? [];
        this.unreadCount = Number(response.no_leidas ?? 0);
        this.lastNotificationFetch = Date.now();
        this.notificationLoading = false;
      },
      error: () => {
        this.lastNotificationFetch = Date.now();
        this.notificationLoading = false;
      },
    });
  }

  private applyMeta(meta: PageMeta | undefined | null): void {
    this.title = meta?.titulo?.trim() ?? '';
    this.backLink = meta?.ruta ?? null;
  }
}
