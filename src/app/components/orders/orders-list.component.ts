import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OrdersStore } from '../../pages/orders/orders.store';
import { OrderCardComponent } from './order-card.component';

type GroupKey = 'PREPARACION' | 'ENTREGADO' | 'CANCELADO';

interface FilterOption {
  label: string;
  value: GroupKey;
  icon: string;
}

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    SelectButtonModule,
    OrderCardComponent
  ],
  template: `
    <section class="orders">
      <!-- Header en 2 filas: (1) Título + +, (2) Categorías con scroll horizontal -->
      <header class="header">
        <div class="title-line">
          <h1>Pedidos</h1>

          <button
            pButton
            icon="pi pi-plus"
            class="add-btn p-button-rounded p-button-icon-only"
            aria-label="Nuevo pedido"
            (click)="goNew()">
          </button>
        </div>

        <!-- Fila de categorías con SCROLL HORIZONTAL -->
        <div class="chips-scroll">
          <p-selectbutton
            [options]="filterOptions"
            [multiple]="true"
            [(ngModel)]="selectedGroupsModel"
            (onChange)="onFilterChange($event.value)"
            optionLabel="label"
            optionValue="value"
            class="state-filters">
            <ng-template pTemplate="item" let-opt>
              <div class="opt">
                <i [class]="opt.icon"></i>
                <span>{{ opt.label }}</span>
                <span class="count" *ngIf="getCount(opt.value) !== undefined">
                  ({{ getCount(opt.value) }})
                </span>
              </div>
            </ng-template>
          </p-selectbutton>
        </div>
      </header>

      <!-- WRAPPER con scroll vertical SOLO para las tarjetas -->
      <div class="scroll-y">
        <div class="grid-list">
          <app-order-card
            *ngFor="let o of filtered(); let i = index; trackBy: trackById"
            [order]="o"
            [isNew]="store.isNew(o.id)"
            (seen)="store.markSeen($event)"
            (deliver)="onDeliver($event)"
            (cancel)="onCancel($event)"
            (edit)="onEdit($event)"
            [ngClass]="['card-variant', 'v' + ((i % 3) + 1)]">
          </app-order-card>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ===== Contenedor general con scroll vertical interno abajo ===== */
    :host{
      display:block;
      height:100%;
      min-height:0;
    }

    .orders{
      padding:16px;
      display:grid;
      grid-template-rows: auto 1fr; /* header + lista */
      height:100%;
      min-height:0;
      overflow:hidden; /* sin scroll general aquí */
    }

    /* ===== Header ===== */
    .header{
      display:grid;
      grid-template-rows: auto auto; /* fila 1: título + + ; fila 2: categorías */
      row-gap:10px;
      margin-bottom:6px;
    }

    .title-line{
      display:flex;
      align-items:center;
      justify-content:space-between; /* título a la izq, + a la der */
      gap:12px;
    }

    h1{
      margin:0;
      font-size:22px;
      font-weight:700;
      color:var(--p-emphasis-high);
    }

    .add-btn.p-button{
      width:46px; height:46px; border-radius:9999px; padding:0;
      display:inline-flex; align-items:center; justify-content:center;
      flex:0 0 auto;
    }
    .add-btn .p-button-icon{ margin:0 !important; }

    /* ===== Categorías con SCROLL HORIZONTAL ===== */
    .chips-scroll{
      overflow-x:auto;           /* <- scroll horizontal */
      overflow-y:hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;     /* Firefox */
      padding-bottom: 2px;       /* evita cortar la sombra del control */
    }

    /* Hacemos que el control ocupe sólo su contenido y no se rompa en líneas */
    :host ::ng-deep p-selectbutton.state-filters .p-selectbutton{
      display:inline-flex;
      width:max-content;     /* que crezca por contenido */
      white-space:nowrap;    /* sin salto de línea */
      gap:0;
      border-radius:999px;
      border:1px solid var(--p-surface-300);
      overflow:hidden;
      background:var(--p-surface-0);
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button{
      border-radius:0; box-shadow:none; border:0; background:transparent; color:var(--p-emphasis-high);
      padding:0 .75rem; height:36px;
      flex:0 0 auto;         /* no permitir que se estire */
      white-space:nowrap;
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button + .p-button{
      border-left: 1px solid var(--p-surface-300);
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button.p-highlight{
      background:var(--p-primary-color);
      color:var(--p-primary-contrast-color);
      font-weight:700;
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button:not(.p-highlight):hover{
      background:var(--p-surface-100);
    }
    .opt{ display:flex; align-items:center; gap:.45rem; }
    .opt .count{ opacity:.85; font-weight:600; }

    /* ===== Scroll vertical interno para tarjetas ===== */
    .scroll-y{
      height:100%;
      min-height:0;
      overflow-y:auto;
      overflow-x:hidden;
    }

    /* ===== Tus columnas (masonry) se mantienen ===== */
    .grid-list{
      display:block !important;
      column-count: 3;
      column-gap: 16px;
    }
    :host ::ng-deep .grid-list app-order-card{
      break-inside: avoid;
      display: inline-block;
      width: 100%;
      margin: 0 0 16px 0;
    }

    /* Breakpoints responsivo */
    @media (max-width: 1200px){
      .grid-list{ column-count: 2; }
    }
    @media (max-width: 768px){
      .grid-list{ column-count: 1; }
    }

    /* Pequeñas mejoras en mobile */
    @media (max-width: 639.98px){
      .orders{ padding:12px; }
      h1{ font-size:20px; }
      .add-btn.p-button{ width:42px; height:42px; }
    }

    /* Variantes de tarjeta: sin cambios */
    :host ::ng-deep app-order-card.card-variant.v1 .order-card{
      --card-bg: color-mix(in srgb, var(--p-primary-50, #f1ecff) 28%, var(--p-surface-0));
      --card-accent: color-mix(in srgb, var(--p-primary-color) 55%, transparent);
      --card-border: color-mix(in srgb, var(--p-primary-200, #d6ccff) 46%, var(--p-surface-200));
    }
    :host ::ng-deep app-order-card.card-variant.v2 .order-card{
      --card-bg: color-mix(in srgb, var(--p-primary-50, #f1ecff) 20%, var(--p-surface-0));
      --card-accent: color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      --card-border: color-mix(in srgb, var(--p-primary-200, #d6ccff) 32%, var(--p-surface-200));
    }
    :host ::ng-deep app-order-card.card-variant.v3 .order-card{
      --card-bg: color-mix(in srgb, var(--p-primary-50, #f1ecff) 14%, var(--p-surface-0));
      --card-accent: color-mix(in srgb, var(--p-primary-color) 28%, transparent);
      --card-border: color-mix(in srgb, var(--p-primary-200, #d6ccff) 22%, var(--p-surface-200));
    }
    :host ::ng-deep app-order-card.is-new .order-card{
      --card-bg: color-mix(in srgb, var(--p-yellow-50, #fff7e6) 42%, var(--p-surface-0));
      --card-accent: color-mix(in srgb, var(--p-yellow-500, #f59e0b) 52%, transparent);
      --card-border: color-mix(in srgb, var(--p-yellow-300, #fcd34d) 50%, var(--p-surface-200));
    }
  `]
})
export class OrdersListComponent {
  filterOptions: FilterOption[] = [
    { label: 'En preparación', value: 'PREPARACION', icon: 'pi pi-hourglass' },
    { label: 'Entregados',      value: 'ENTREGADO',   icon: 'pi pi-check-circle' },
    { label: 'Cancelados',      value: 'CANCELADO',   icon: 'pi pi-times-circle' },
  ];

  selectedGroups = signal<GroupKey[]>(['PREPARACION']);
  selectedGroupsModel: GroupKey[] = this.selectedGroups();

  constructor(public store: OrdersStore, private router: Router) {}

  orders = computed(() => this.store.orders());

  private toGroup(s: any): GroupKey {
    if (s === 'ENTREGADO') return 'ENTREGADO';
    if (s === 'CANCELADO') return 'CANCELADO';
    return 'PREPARACION';
  }

  private readonly countsMap = computed<Record<GroupKey, number>>(() => {
    const c: Record<GroupKey, number> = { PREPARACION: 0, ENTREGADO: 0, CANCELADO: 0 };
    for (const o of this.orders()) c[this.toGroup((o as any).status)]++;
    return c;
  });
  getCount(g: GroupKey){ return this.countsMap()[g] ?? 0; }

  readonly filtered = computed(() => {
    const active = new Set(this.selectedGroups());
    if (active.size === 0) return [];
    return this.orders().filter(o => active.has(this.toGroup((o as any).status)));
  });

  onFilterChange(selected: GroupKey[] | undefined){
    this.selectedGroups.set([...(selected ?? [])]);
    this.selectedGroupsModel = this.selectedGroups();
  }

  onDeliver(id: string){ this.store.setDelivered(id); }
  onCancel(id: string){ this.store.cancel(id); }
  onEdit(id: string){ this.router.navigateByUrl(`/orders/new?edit=${id}&openCart=1`); }
  goNew(){ this.router.navigateByUrl('/orders/new'); }

  trackById = (_: number, x: any) => x?.id;
}
