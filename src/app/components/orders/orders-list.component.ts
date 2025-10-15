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
  color: string;
  activeColor: string;
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
      <!-- Header -->
      <header class="header">
        <div class="title-line">
          <div class="title-left">
            <span class="title-icon pi pi-list-check" aria-hidden="true"></span>
            <h1>Pedidos</h1>
            <span class="title-badge" aria-label="Total de pedidos">{{ ordersCount() }}</span>
          </div>

          <button
            pButton
            icon="pi pi-plus"
            class="add-btn p-button-rounded p-button-icon-only"
            aria-label="Nuevo pedido"
            (click)="goNew()">
          </button>
        </div>

        <!-- Filtros con botones separados -->
        <div class="filters-scroll">
          <div class="filters-container">
            <div
              *ngFor="let filter of filterOptions"
              class="filter-button"
              [class.active]="selectedGroups().includes(filter.value)"
              [class.preparacion]="filter.value === 'PREPARACION'"
              [class.entregado]="filter.value === 'ENTREGADO'"
              [class.cancelado]="filter.value === 'CANCELADO'"
              (click)="toggleFilter(filter.value)">
              <div class="filter-content">
                <div class="icon-container">
                  <i [class]="filter.icon"></i>
                </div>
                <div class="text-container">
                  <span class="filter-label">{{ filter.label }}</span>
                  <span class="filter-count">{{ getCount(filter.value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Lista -->
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
    /* ===== Contenedor general ===== */
    :host{ display:block; height:100%; min-height:0; }
    .orders{
      padding:16px;
      display:grid;
      grid-template-rows:auto 1fr;
      height:100%;
      min-height:0;
      overflow:hidden;
    }

    /* ===== Header ===== */
    .header{
      display:grid;
      grid-template-rows:auto auto;
      row-gap:16px;
      margin-bottom:6px;
    }

    .title-line{
      display:flex; align-items:flex-end; justify-content:space-between; gap:12px;
      position:relative;
      padding-bottom:.25rem;
    }
    /* línea/acento bajo el título */
    .title-line::after{
      content:"";
      position:absolute;
      left:0; right:0; bottom:0;
      height:2px;
      background: linear-gradient(90deg, var(--p-surface-300), transparent 60%);
    }

    .title-left{
      display:flex; align-items:center; gap:.75rem;
      min-height:48px;
    }
    .title-icon{
      width:34px; height:34px; border-radius:10px;
      display:inline-flex; align-items:center; justify-content:center;
      background: var(--p-surface-100);
      color: var(--p-primary-600);
      border:1px solid var(--p-surface-300);
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      font-size:1rem;
    }
    h1{
      margin:0; line-height:1;
      font-size:24px;              /* un poco más grande */
      font-weight:800;             /* más presencia */
      letter-spacing:.2px;
      color:var(--p-emphasis-high);
    }
    .title-badge{
      margin-left:.25rem;
      padding:.15rem .55rem;
      border-radius:999px;
      font-size:.85rem; font-weight:800;
      background: var(--p-surface-200);
      color: var(--p-surface-900);
      border:1px solid var(--p-surface-300);
      line-height:1;
    }

    .add-btn.p-button{ width:46px; height:46px; border-radius:9999px; padding:0; display:inline-flex; align-items:center; justify-content:center; }
    .add-btn .p-button-icon{ margin:0 !important; }

    /* ===== Filtros ===== */
    .filters-scroll{
      overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch;
      scrollbar-width:thin; padding:4px 4px 12px 4px; margin:0 -4px;
    }
    .filters-container{ display:flex; gap:12px; padding:4px; min-width:min-content; }
    .filter-button{
      display:flex; align-items:center;
      min-width:120px; height:60px; padding:0 16px;
      border:2px solid var(--p-surface-300); border-radius:12px; background:var(--p-surface-0);
      cursor:pointer; user-select:none;
      transition:all .3s cubic-bezier(.4,0,.2,1);
      box-shadow:0 2px 6px rgba(0,0,0,.08);
    }
    .filter-button:hover{ transform:translateY(-1px); box-shadow:0 3px 12px rgba(0,0,0,.12); border-color:var(--p-primary-300); }
    .filter-button.active{ transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,.15); }
    .filter-button.active.preparacion{ background:linear-gradient(135deg, var(--p-blue-50), var(--p-blue-100)); border-color:var(--p-blue-400); box-shadow:0 4px 14px rgba(59,130,246,.25); }
    .filter-button.active.entregado{ background:linear-gradient(135deg, var(--p-green-50), var(--p-green-100)); border-color:var(--p-green-400); box-shadow:0 4px 14px rgba(34,197,94,.25); }
    .filter-button.active.cancelado{ background:linear-gradient(135deg, var(--p-red-50), var(--p-red-100)); border-color:var(--p-red-400); box-shadow:0 4px 14px rgba(239,68,68,.25); }

    .filter-content{ display:flex; align-items:center; gap:12px; width:100%; }
    .icon-container{ display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; background:var(--p-surface-100); flex-shrink:0; }
    .filter-button.active.preparacion .icon-container{ background:var(--p-blue-200); }
    .filter-button.active.entregado .icon-container{ background:var(--p-green-200); }
    .filter-button.active.cancelado .icon-container{ background:var(--p-red-200); }

    .icon-container i{ font-size:1rem; }
    .filter-button.preparacion .icon-container i{ color:var(--p-blue-600); }
    .filter-button.entregado .icon-container i{ color:var(--p-green-600); }
    .filter-button.cancelado .icon-container i{ color:var(--p-red-600); }
    .filter-button.active.preparacion .icon-container i{ color:var(--p-blue-700); }
    .filter-button.active.entregado .icon-container i{ color:var(--p-green-700); }
    .filter-button.active.cancelado .icon-container i{ color:var(--p-red-700); }

    .text-container{ display:flex; flex-direction:column; align-items:center; gap:2px; flex:1; text-align:center; }
    .filter-label{ font-size:12px; font-weight:600; color:var(--p-emphasis-high); white-space:nowrap; }
    .filter-button.active .filter-label{ font-weight:700; }
    .filter-button.active.preparacion .filter-label{ color:var(--p-blue-800); }
    .filter-button.active.entregado .filter-label{ color:var(--p-green-800); }
    .filter-button.active.cancelado .filter-label{ color:var(--p-red-800); }

    .filter-count{ font-size:18px; font-weight:800; color:var(--p-emphasis-medium); line-height:1; }
    .filter-button.active .filter-count{ color:var(--p-emphasis-high); }
    .filter-button.active.preparacion .filter-count{ color:var(--p-blue-800); }
    .filter-button.active.entregado .filter-count{ color:var(--p-green-800); }
    .filter-button.active.cancelado .filter-count{ color:var(--p-red-800); }

    /* ===== Lista ===== */
    .scroll-y{ height:100%; min-height:0; overflow-y:auto; overflow-x:hidden; }
    .grid-list{ display:block !important; column-count:3; column-gap:16px; }
    :host ::ng-deep .grid-list app-order-card{ break-inside:avoid; display:inline-block; width:100%; margin:0 0 16px 0; }

    /* Breakpoints */
    @media (max-width:1200px){ .grid-list{ column-count:2; } }
    @media (max-width:768px){
      .grid-list{ column-count:1; }
      .title-left{ min-height:44px; }
      h1{ font-size:22px; }
      .title-icon{ width:32px; height:32px; }
      .filter-button{ min-width:110px; height:55px; padding:0 12px; }
      .filter-content{ gap:10px; }
      .icon-container{ width:28px; height:28px; }
      .filter-count{ font-size:16px; }
      .filter-label{ font-size:11px; }
    }
    @media (max-width:639.98px){
      .orders{ padding:12px; }
      .title-line{ padding-bottom:.2rem; }
      h1{ font-size:20px; }
      .add-btn.p-button{ width:42px; height:42px; }
      .filters-container{ gap:8px; }
      .filter-button{ min-width:100px; height:50px; padding:0 10px; }
      .filter-content{ gap:8px; }
      .icon-container{ width:24px; height:24px; }
      .icon-container i{ font-size:.9rem; }
      .filter-label{ font-size:10px; }
      .filter-count{ font-size:14px; }
    }
  `]
})
export class OrdersListComponent {
  filterOptions: FilterOption[] = [
    { label: 'En preparación', value: 'PREPARACION', icon: 'pi pi-hourglass',  color: 'blue',  activeColor: 'blue' },
    { label: 'Entregados',     value: 'ENTREGADO',   icon: 'pi pi-check-circle', color: 'green', activeColor: 'green' },
    { label: 'Cancelados',     value: 'CANCELADO',   icon: 'pi pi-times-circle',  color: 'red',   activeColor: 'red' },
  ];

  selectedGroups = signal<GroupKey[]>(['PREPARACION']);
  selectedGroupsModel: GroupKey[] = this.selectedGroups();

  constructor(public store: OrdersStore, private router: Router) {}

  orders = computed(() => this.store.orders());
  /* total para el badge del título */
  ordersCount = computed(() => this.orders().length);

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

  toggleFilter(filter: GroupKey) {
    const current = this.selectedGroups();
    if (current.includes(filter)) {
      this.selectedGroups.set(current.filter(f => f !== filter));
    } else {
      this.selectedGroups.set([...current, filter]);
    }
    this.selectedGroupsModel = this.selectedGroups();
  }

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
