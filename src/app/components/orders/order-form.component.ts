import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

/* PrimeNG 20 */
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToolbarModule } from 'primeng/toolbar';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';

import { OrdersStore } from '../../pages/orders/orders.store';
import { OrderItem } from '../../pages/orders/orders.types';

type Category = {
  key: string;
  label: string;
  productIds: string[];
};

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, DrawerModule, OverlayBadgeModule,
    TableModule, DividerModule, InputTextModule, SelectButtonModule,
    InputNumberModule, ToolbarModule, RippleModule, TagModule
  ],
  template: `
    <section class="order-form">
      <!-- HEADER -->
      <div class="header">
        <h1>Nuevo Pedido</h1>

        <!-- Carrito con badge -->
        <p-overlaybadge [value]="itemsCount()" severity="info">
          <button
            pButton
            class="p-button-rounded p-button-text cart-btn"
            icon="pi pi-shopping-cart"
            (click)="toggleCart(true)"
            aria-label="Resumen de pedido">
          </button>
        </p-overlaybadge>
      </div>

      <!-- CATEGORÍAS (ANCHORS) -->
      <nav class="cats">
        <a *ngFor="let c of categories"
           href="javascript:void(0)"
           [class.active]="activeKey()===c.key"
           (click)="scrollTo(c.key)">
          {{ c.label }}
        </a>
      </nav>

      <!-- SECCIONES (MISMA PÁGINA) -->
      <div class="sections">
        <section *ngFor="let c of categories" class="cat-section" [attr.id]="c.key">
          <h2 class="cat-title">{{ c.label }}</h2>

          <div class="cards">
            <p-card *ngFor="let p of productsByCategory(c)" class="prod-card">
              <ng-template pTemplate="header">
                <div class="card-header">
                  <div class="title">{{ p.name }}</div>
                  <div class="price">{{ p.price | number:'1.0-0' }} Bs</div>
                </div>
              </ng-template>

              <div class="card-body">
                <div class="thumb"></div> <!-- placeholder de imagen -->
                <div class="desc">Descripción breve del producto.</div>
              </div>

              <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-plus" label="Agregar" class="p-button-lg w-full" (click)="addItem(p)"></button>
              </ng-template>
            </p-card>
          </div>
        </section>
      </div>

      <!-- DRAWER (CARRITO / RESUMEN) DESDE ABAJO -->
      <p-drawer
        [(visible)]="cartOpen"
        position="bottom"               
        [modal]="true"
        [showCloseIcon]="true"
        styleClass="cart cart-bottom">

        <div class="cart-head">
          <h3>Resumen de pedido</h3>
          <div class="chipset">
            <p-tag [value]="type==='MESA' ? 'Mesa' : 'Llevar'" [severity]="type==='MESA' ? 'info' : 'warning'"></p-tag>
            <p-tag *ngIf="customer" [value]="customer" severity="success" icon="pi pi-user"></p-tag>
          </div>
        </div>

        <!-- Datos del pedido -->
        <div class="row">
          <label>Cliente</label>
          <input pInputText [(ngModel)]="customer" placeholder="Nombre del cliente" />
        </div>

        <div class="row">
          <label>Tipo</label>
          <p-selectButton [options]="typeOptions" [(ngModel)]="type" optionLabel="label" optionValue="value"></p-selectButton>
        </div>

        <div class="row" *ngIf="type==='MESA'">
          <label>Mesa</label>
          <p-inputNumber [(ngModel)]="table" [min]="1" [useGrouping]="false" [showButtons]="true"></p-inputNumber>
        </div>

        <p-divider></p-divider>

        <!-- Items -->
        <div *ngIf="items().length; else emptyCart">
          <p-table [value]="items()" responsiveLayout="scroll" class="cart-table">
            <ng-template pTemplate="header">
              <tr>
                <th>Producto</th>
                <th style="width:120px">Cant.</th>
                <th style="width:120px">PU</th>
                <th style="width:140px">Subt.</th>
                <th style="width:56px"></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-it let-i="rowIndex">
              <tr>
                <td class="prod">{{ it.name }}</td>
                <td>
                  <div class="qty">
                    <button pButton icon="pi pi-minus" class="p-button-text p-button-rounded" (click)="dec(i)"></button>
                    <span class="q">{{ it.qty }}</span>
                    <button pButton icon="pi pi-plus"  class="p-button-text p-button-rounded" (click)="inc(i)"></button>
                  </div>
                </td>
                <td>{{ it.price | number:'1.0-0' }}</td>
                <td><b>{{ (it.qty * it.price) | number:'1.0-0' }}</b></td>
                <td>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger" (click)="remove(i)"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <ng-template #emptyCart>
          <div class="empty">
            <i class="pi pi-shopping-bag"></i>
            <span>Aún no hay productos</span>
          </div>
        </ng-template>

        <p-divider></p-divider>

        <div class="totals">
          <div class="line">
            <span>Descuento</span>
            <span>0,00 Bs</span>
          </div>
          <div class="line total">
            <span>Total</span>
            <span><b>{{ total() | number:'1.0-0' }} Bs</b></span>
          </div>
        </div>

        <p-toolbar class="toolbar">
          <div class="p-toolbar-group-end">
            <button pButton label="Continuar" class="p-button-success" [disabled]="!items().length" (click)="save()"></button>
          </div>
        </p-toolbar>
      </p-drawer>
    </section>
  `,
  styles: [`
    :host{ display:block; }
    .order-form{ padding:16px; }
    @media (min-width: 992px){ .order-form{ padding:20px; } }

    .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .header h1{ margin:0; font-size:22px; font-weight:700; color:var(--p-emphasis-high); }

    /* Categorías */
    .cats{ display:flex; gap:12px; overflow-x:auto; padding:8px 0; margin-bottom:8px; border-bottom:1px solid var(--p-surface-200); }
    .cats a{ text-decoration:none; color:var(--p-emphasis-medium); padding:10px 12px; border-radius:10px; white-space:nowrap; font-weight:600; }
    .cats a.active, .cats a:hover{ color:var(--p-primary-700); background:var(--p-primary-50); }

    .sections{ display:flex; flex-direction:column; gap:24px; }
    .cat-section{ scroll-margin-top: 90px; }
    .cat-title{ margin:0 0 10px; font-size:20px; font-weight:800; color:var(--p-emphasis-high); }

    /* ====== CARDS MÁS GRANDES ====== */
    .cards{
      display:grid; gap:16px;
      grid-template-columns: repeat(1, minmax(0,1fr));
    }
    @media (min-width: 640px){ .cards{ grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1200px){ .cards{ grid-template-columns: repeat(3, 1fr); } }

    .prod-card{ border-radius:16px; }
    .card-header{ display:flex; justify-content:space-between; align-items:center; }
    .card-header .title{ font-weight:800; font-size:1.05rem; }
    .card-header .price{ font-weight:800; font-size:1.05rem; color:var(--p-emphasis-high); }

    .card-body{
      display:flex; gap:14px; align-items:center; padding-top:6px; padding-bottom:6px;
    }
    .thumb{
      flex:0 0 160px; height:120px;       /* <- más grande */
      border-radius:12px; background:var(--p-surface-200);
    }
    .desc{ color:var(--p-emphasis-medium); }

    .w-full{ width:100%; }

    /* Drawer desde abajo */
    :host ::ng-deep .cart-bottom.p-drawer{
      height: min(78vh, 640px);          /* alto del panel */
      width: 100%;
      border-top-left-radius:16px;
      border-top-right-radius:16px;
    }
    .cart-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
    .chipset{ display:flex; gap:8px; }

    .row{ display:flex; align-items:center; gap:10px; margin:10px 0; }
    .row label{ width:80px; color:var(--p-emphasis-medium); }

    .cart-table .prod{ font-weight:600; }
    .qty{ display:flex; align-items:center; gap:6px; }
    .q{ min-width:18px; text-align:center; font-weight:600; }

    .empty{ display:flex; gap:8px; align-items:center; color:var(--p-text-muted-color); padding:6px 0; }

    .totals{ display:flex; flex-direction:column; gap:8px; }
    .totals .line{ display:flex; justify-content:space-between; color:var(--p-emphasis-medium); }
    .totals .line.total{ color:var(--p-emphasis-high); font-size:16px; }

    .toolbar{ position: sticky; bottom: 0; background:var(--p-surface-0); border-radius:12px; box-shadow:var(--p-shadow-1); margin-top:10px; }
  `]
})
export class OrderFormComponent {
  private store = inject(OrdersStore);
  private router = inject(Router);

  /* Catálogo (mock) */
  allProducts: OrderItem[] = [
    { id: 'sopa-mani',  name: 'Sopa de Maní',   qty: 1, price: 18 },
    { id: 'sopa-fideo', name: 'Sopa de Fideo',  qty: 1, price: 15 },
    { id: 'mini-coca',  name: 'Mini Coca',      qty: 1, price: 8 },
    { id: 'coca-2l',    name: 'Coca 2lt',       qty: 1, price: 18 },
    { id: 'bife',       name: 'Bife de Chorizo',qty: 1, price: 55 },
  ];

  /* Categorías (dinámicas) */
  categories: Category[] = [
    { key: 'SOPAS',      label: 'SOPAS',      productIds: ['sopa-mani','sopa-fideo'] },
    { key: 'BEBIDAS',    label: 'BEBIDAS',    productIds: ['mini-coca','coca-2l'] },
    { key: 'ESPECIALES', label: 'ESPECIALES', productIds: ['bife'] },
  ];

  cartOpen = false;
  activeKey = signal<string>(this.categories[0]?.key ?? '');

  // Pedido
  items = signal<OrderItem[]>([]);
  customer = '';
  type: 'LLEVAR' | 'MESA' = 'MESA';
  table: number | null = 1;

  typeOptions = [
    { label: 'Mesa', value: 'MESA' },
    { label: 'Llevar', value: 'LLEVAR' }
  ];

  itemsCount = computed(() => this.items().reduce((n, it) => n + it.qty, 0));
  total = computed(() => this.items().reduce((acc, it) => acc + it.qty * it.price, 0));

  productsByCategory(cat: Category) {
    return this.allProducts.filter(p => cat.productIds.includes(p.id));
  }

  scrollTo(key: string) {
    this.activeKey.set(key);
    const el = document.getElementById(key);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  toggleCart(v: boolean){ this.cartOpen = v; }

  addItem(p: OrderItem) {
    const list = [...this.items()];
    const idx = list.findIndex(x => x.id === p.id);
    if (idx >= 0) list[idx] = { ...list[idx], qty: list[idx].qty + 1 };
    else list.push({ ...p, qty: 1 });
    this.items.set(list);
  }
  inc(i: number){ const l=[...this.items()]; l[i]={...l[i], qty:l[i].qty+1}; this.items.set(l); }
  dec(i: number){ const l=[...this.items()]; l[i]={...l[i], qty:Math.max(1,l[i].qty-1)}; this.items.set(l); }
  remove(i: number){ const l=[...this.items()]; l.splice(i,1); this.items.set(l); }

  save(){
    this.store.addOrder({
      customer: this.customer || undefined,
      type: this.type,
      table: this.type === 'MESA' ? (this.table ?? 1) : null,
      items: this.items(),
    });
    this.router.navigateByUrl('/orders');
  }
  cancel(){ this.router.navigateByUrl('/orders'); }
}
