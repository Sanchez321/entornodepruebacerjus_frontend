import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PageMetaService } from '@/app/services/page_meta.service';
import {
  AJ_ESTADO_OPCIONES,
  AJ_TIPO_OPCIONES,
  AsistenciaJustificacionEstadoFiltro,
  AsistenciaJustificacionTipoFiltro,
  estadoBadgeClass,
} from '../models/justificacion.dominio';
import {
  VMAsistenciaJustificacionItem,
  VMAsistenciaJustificacionResumen,
} from '../models/justificacion.vm';
import { JustificacionService } from '../services/justificacion.service';

@Component({
  selector: 'app-justificacion-lista-mis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './justificacion.lista.mis.html',
  styleUrl: './justificacion.lista.mis.css',
})
export class JustificacionListaMis implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(JustificacionService);
  private readonly router = inject(Router);
  private readonly pageMeta = inject(PageMetaService);

  readonly estadoOpciones = AJ_ESTADO_OPCIONES;
  readonly tipoOpciones = AJ_TIPO_OPCIONES;
  readonly skeletonCards = [0, 1, 2];

  form = this.fb.group({
    desde: new FormControl<string>(''),
    hasta: new FormControl<string>(''),
    tipo: new FormControl<AsistenciaJustificacionTipoFiltro>(''),
    estado: new FormControl<AsistenciaJustificacionEstadoFiltro>(''),
  });

  items: VMAsistenciaJustificacionItem[] = [];
  resumen: VMAsistenciaJustificacionResumen | null = null;
  total = 0;
  page = 1;
  pageSize = 9;
  loading = false;
  firstLoad = true;

  private subForm?: Subscription;

  get lastPage(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get pageFrom(): number {
    return this.total ? (this.page - 1) * this.pageSize + 1 : 0;
  }

  get pageTo(): number {
    return Math.min(this.total, this.page * this.pageSize);
  }

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Mis Justificaciones',
      ruta: ['/asistencia'],
    });

    this.load();
    this.subForm = this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
  }

  ngOnDestroy(): void {
    this.subForm?.unsubscribe();
    this.pageMeta.clear();
  }

  clear(): void {
    this.form.reset({ desde: '', hasta: '', tipo: '', estado: '' });
    this.page = 1;
    this.load();
  }

  goTo(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.load();
  }

  irRegistrar(): void {
    this.router.navigate(['/asistencia/justificacion/registrar']);
  }

  estadoClass(estado: any): string {
    return estadoBadgeClass(estado);
  }

  trackById(_index: number, item: VMAsistenciaJustificacionItem): number {
    return item.aj_ID;
  }

  private load(): void {
    this.loading = true;
    const value = this.form.getRawValue();
    const filters = {
      desde: value.desde || undefined,
      hasta: value.hasta || undefined,
      tipo: value.tipo || undefined,
      estado: value.estado || undefined,
    };

    forkJoin({
      page: this.service.listMis({
        ...filters,
        page: this.page,
        pageSize: this.pageSize,
      }),
      summary: this.service.getMisResumen(filters),
    }).subscribe({
      next: ({ page, summary }) => {
        this.items = page.items;
        this.total = page.total;
        this.page = page.page;
        this.pageSize = page.pageSize;
        this.resumen = summary;
        this.loading = false;
        this.firstLoad = false;
      },
      error: () => {
        this.loading = false;
        this.firstLoad = false;
      },
    });
  }
}
