// src/app/pages/tramite/tramite.lista/tramite.lista.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { TramiteService } from '../services/tramite.service';
import { VMTramiteListaSimple } from '../models/tramite.vm';
import {ESTADO_TRAMITE_OPCIONES,estadoTramiteBadgeClass,} from '../models/tramite.dominio';
import { PageMetaService } from '@/app/services/page_meta.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-tramite-lista',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './tramite.lista.html',
    styleUrl: './tramite.lista.css',
})
    export class TramiteLista implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private service = inject(TramiteService);
    private pageMeta = inject(PageMetaService);

    private subForm = new Subscription();
    private syncingScroll = false;

    readonly estadoTramiteOpciones = ESTADO_TRAMITE_OPCIONES;

    form = this.fb.group({
        id: [null as number | null],
        dni: [''],
        expediente: [''],
        entidad: [''],
        asunto: [''],
        estadoTramite: [''],
    });

    items: VMTramiteListaSimple[] = [];
    total = 0;
    page = 1;
    pageSize = 9;

    loading = false;
    showOverlay = false;

    firstLoad = true;
    showEmpty = false;

    shownFrom = 0;
    shownTo = 0;
    shownPage = 1;
    shownLastPage = 1;
    shownTotal = 0;

    private pendItems: VMTramiteListaSimple[] = [];
    private pendTotal = 0;
    private pendFrom = 0;
    private pendTo = 0;
    private pendPage = 1;
    private pendLastPage = 1;

    private reqSeq = 0;
    private overlayTimer: any;
    private emptyTimer: any;
    private overlayShownAt = 0;
    private firstPaintStart = 0;

    private readonly overlayDelay = 180;
    private readonly minOverlayMs = 220;
    private readonly firstSkeletonMinMs = 200;

    headerBlockPx = 96;
    tableExtraPx = 32;

    get listMinHeight(): number {
        return this.headerBlockPx + this.pageSize * 48 + this.tableExtraPx;
    }

    get skeletonRows(): number[] {
        return Array.from({ length: this.pageSize }, (_, i) => i);
    }

    get lastPage(): number {
        return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
    }

    rangeReserveCh = 9;
    totalReserveCh = 7;

    ngOnInit(): void {
        this.pageMeta.replace({
        titulo: 'Lista de Trámites',
        });

        this.load();

        this.subForm.add(
        this.form.valueChanges
            .pipe(
            debounceTime(300),
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            )
            .subscribe(() => {
            this.page = 1;
            this.load();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subForm.unsubscribe();
        this.cancelTimers();
        this.pageMeta.clear();
    }

    clear(): void {
        this.form.reset({
        id: null,
        dni: '',
        expediente: '',
        entidad: '',
        asunto: '',
        estadoTramite: '',
        });

        this.page = 1;
        this.load();
    }

    goTo(page: number): void {
        if (page < 1) return;

        const last = this.lastPage;
        if (last && page > last) return;

        this.page = page;
        this.load();
    }

    private cancelTimers(): void {
        clearTimeout(this.overlayTimer);
        clearTimeout(this.emptyTimer);
    }

    load(): void {
        this.loading = true;
        this.cancelTimers();

        const myReq = ++this.reqSeq;
        this.showEmpty = false;

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

        const v = this.form.value;

        this.service.list({
        page: this.page,
        pageSize: this.pageSize,

        id: v.id ?? undefined,
        dni: v.dni || undefined,
        expediente: v.expediente || undefined,
        entidad: v.entidad || undefined,
        asunto: v.asunto || undefined,
        estadoTramite: v.estadoTramite as any || undefined,
        })
        .subscribe({
        next: (res) => {
            if (myReq !== this.reqSeq) return;

            const incoming = res.items ?? [];
            const total = res.total ?? incoming.length;

            const from = incoming.length > 0 ? (this.page - 1) * this.pageSize + 1 : 0;
            const to = (this.page - 1) * this.pageSize + incoming.length;
            const last = this.pageSize ? Math.max(1, Math.ceil(total / this.pageSize)) : 1;

            this.pendItems = incoming;
            this.pendTotal = total;
            this.pendFrom = from;
            this.pendTo = to;
            this.pendPage = this.page;
            this.pendLastPage = last;

            this.finishLoadingWithOverlayMin();
        },
        error: () => {
            if (myReq !== this.reqSeq) return;

            this.pendItems = this.items;
            this.pendTotal = this.total;
            this.pendFrom = this.shownFrom;
            this.pendTo = this.shownTo;
            this.pendPage = this.shownPage || this.page;
            this.pendLastPage = this.shownLastPage || this.lastPage;

            this.finishLoadingWithOverlayMin();
        },
        });
    }

    private finishLoadingWithOverlayMin(): void {
        const complete = () => {
        this.loading = false;
        clearTimeout(this.overlayTimer);

        if (this.showOverlay) {
            const elapsed = performance.now() - this.overlayShownAt;
            const remain = Math.max(0, this.minOverlayMs - elapsed);
            setTimeout(() => (this.showOverlay = false), remain);
        } else {
            this.showOverlay = false;
        }

        this.items = this.pendItems;
        this.total = this.pendTotal;
        this.shownFrom = this.pendFrom;
        this.shownTo = this.pendTo;
        this.shownPage = this.pendPage;
        this.shownLastPage = this.pendLastPage;
        this.shownTotal = this.pendTotal;

        this.showEmpty = this.items.length === 0;

        if (this.firstLoad) {
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

    estadoBadgeClass(estado: any): string {
        return estadoTramiteBadgeClass(estado);
    }

    trackById(_index: number, item: VMTramiteListaSimple) {
        return item.id;
    }

    syncHorizontalScroll(from: HTMLElement, to: HTMLElement): void {
        if (this.syncingScroll) return;

        this.syncingScroll = true;
        to.scrollLeft = from.scrollLeft;

        queueMicrotask(() => {
        this.syncingScroll = false;
        });
    }
}