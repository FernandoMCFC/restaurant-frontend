import {
  Component,
  inject,
  signal,
  computed,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

/* PrimeNG v20 */
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

/** Catálogo */
type Category = { key: string; label: string; productIds: string[] };
type Product = OrderItem & { description?: string };

@Component({
  selector: 'app-order-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DrawerModule,
    OverlayBadgeModule,
    TableModule,
    DividerModule,
    InputTextModule,
    SelectButtonModule,
    InputNumberModule,
    ToolbarModule,
    RippleModule,
    TagModule,
  ],
  template: `
    <!-- LAYOUT de 3 filas: (1) header fijo, (2) tabs fijos, (3) lista scroll -->
    <section class="order-form">
      <!-- (1) HEADER FIJO -->
      <div class="topbar">
        <h1>Nuevo Pedido</h1>

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

      <!-- (2) CATEGORÍAS FIJAS + línea -->
      <nav class="cats">
        <a
          *ngFor="let c of categories"
          href="javascript:void(0)"
          [class.active]="activeKey() === c.key"
          (click)="setActive(c.key)"
        >{{ c.label }}</a>
      </nav>
      <div class="sep"></div>

      <!-- (3) SOLO LA LISTA HACE SCROLL -->
      <div class="list-area">
        <div class="section">
          <h3>{{ activeLabel() }}</h3>

          <div class="grid">
            <div
              class="product-card"
              *ngFor="let p of currentProducts()"
            >
              <p-card>
                <ng-template pTemplate="header">
                  <!-- Placeholder visual (sin imagen real) -->
                  <div class="prod-media ph">
                    <i class="pi pi-image"></i>
                  </div>
                </ng-template>

                <div class="prod-body">
                  <div class="prod-row">
                    <span class="prod-name">{{ p.name }}</span>
                    <span class="prod-price">{{ p.price | number:'1.2-2' }} Bs</span>
                  </div>
                  <p class="prod-desc">Breve descripción del producto</p>
                </div>

                <ng-template pTemplate="footer">
                  <div class="prod-footer">
                    <button
                      pButton
                      class="add-btn"
                      icon="pi pi-plus"
                      (click)="addItem(p)"
                      [rounded]="true"
                      [text]="false"
                      [ariaLabel]="'Agregar ' + p.name">
                    </button>
                  </div>
                </ng-template>
              </p-card>
            </div>
          </div>
        </div>
      </div>

      <!-- DRAWER (RESUMEN) - DERECHA -->
      <p-drawer
        [(visible)]="cartOpen"
        position="right"
        [modal]="true"
        [showCloseIcon]="true"
        [blockScroll]="true"
        [style]="{ width: drawerWidth() }"
        styleClass="cart cart-right">

        <div class="cart-head">
          <h3>Resumen de pedido</h3>
          <div class="chipset">
            <p-tag
              [value]="type === 'MESA' ? 'Mesa' : 'Llevar'"
              [severity]="type === 'MESA' ? 'info' : 'warning'"></p-tag>
            <p-tag *ngIf="customer" [value]="customer" severity="success" icon="pi pi-user"></p-tag>
          </div>
        </div>

        <div class="cart-body">
          <div class="row">
            <label>Cliente</label>
            <input pInputText [(ngModel)]="customer" placeholder="Nombre del cliente" />
          </div>

          <div class="row">
            <label>Tipo</label>
            <p-selectbutton
              [options]="typeOptions"
              [(ngModel)]="type"
              optionLabel="label"
              optionValue="value">
            </p-selectbutton>
          </div>

          <div class="row" *ngIf="type === 'MESA'">
            <label>Mesa</label>
            <p-inputNumber
              [(ngModel)]="table"
              inputId="mesa"
              [min]="1"
              [max]="99"
              [useGrouping]="false"
              [showButtons]="true"></p-inputNumber>
          </div>

          <p-divider></p-divider>

          <div *ngIf="items().length; else empty">
            <p-table
              [value]="items()"
              [tableStyle]="{ 'min-width': '100%' }"
              [scrollable]="true" scrollHeight="260px">
              <ng-template pTemplate="header">
                <tr>
                  <th>Producto</th>
                  <th style="width: 110px">Cant.</th>
                  <th style="width: 110px">Precio</th>
                  <th style="width: 48px"></th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row let-i="rowIndex">
                <tr>
                  <td>
                    <div class="item-name">{{ row.name }}</div>
                    <div class="muted">Unit: {{ row.price | number:'1.2-2' }} Bs</div>
                  </td>
                  <td>
                    <div class="qty">
                      <button pButton icon="pi pi-minus" (click)="dec(i)" [rounded]="true" [text]="true"></button>
                      <span>{{ row.qty }}</span>
                      <button pButton icon="pi pi-plus" (click)="inc(i)" [rounded]="true" [text]="true"></button>
                    </div>
                  </td>
                  <td class="right">{{ row.qty * row.price | number:'1.2-2' }} Bs</td>
                  <td class="right">
                    <button pButton icon="pi pi-times" (click)="remove(i)" [rounded]="true" [text]="true"></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <ng-template #empty>
            <div class="empty">
              <i class="pi pi-inbox"></i>
              Aún no hay productos
            </div>
          </ng-template>
        </div>

        <div class="toolbar">
          <div class="totals">
            <div class="line">
              <span>Descuento</span>
              <strong>{{ discount | number:'1.2-2' }} Bs</strong>
            </div>
            <div class="line total">
              <span>Total</span>
              <strong>{{ total() | number:'1.2-2' }} Bs</strong>
            </div>
          </div>
          <div class="actions">
            <button pButton label="Continuar" (click)="save()"></button>
            <button pButton label="Cancelar" severity="secondary" (click)="cancel()" [text]="true"></button>
          </div>
        </div>
      </p-drawer>
    </section>
  `,
  styles: [
    `
      :root {
        /* Si tienes un topbar global, pon aquí su altura y la usamos en el alto disponible */
        --app-topbar-h: 0px;
      }

      :host { display: block; }

      /* 3 filas: header (auto) + tabs (auto) + lista (1fr con scroll). Altura = viewport - topbar global */
      .order-form {
        height: calc(100vh - var(--app-topbar-h));
        display: grid;
        grid-template-rows: auto auto 1fr;
        gap: 0;
        padding: 16px;
      }

      /* (1) HEADER FIJO */
      .topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding-bottom: 8px;
      }
      .topbar h1 { margin: 0; font-size: 22px; font-weight: 700; color: var(--p-emphasis-high); }
      .cart-btn { font-size: 1.5rem; }

      /* (2) CATS FIJAS */
      .cats {
        display: flex; gap: 12px; overflow-x: auto; padding: 8px 0 10px;
      }
      .cats a {
        white-space: nowrap; font-weight: 700; color: var(--p-emphasis-medium);
        text-decoration: none; padding: 0 2px 6px;
      }
      .cats a.active { color: var(--p-primary-color); border-bottom: 2px solid var(--p-primary-color); }
      .sep {
        height: 1px;
        background: var(--p-surface-200);
        margin: 0 0 8px;
      }

      /* (3) LISTA SCROLL */
      .list-area {
        min-height: 0;            /* clave para que 1fr permita overflow */
        overflow: auto;           /* aquí ocurre el scroll */
        padding-right: 4px;       /* pequeño espacio para scrollbar */
      }

      .section h3 { margin: 0 0 10px 0; font-size: 16px; color: var(--p-emphasis-high); }

      /* Grid de productos
         - 2 en móviles
         - 3 en >= 1200px
         - 4 en >= 1536px (máximo 4 en pantallas muy grandes)
      */
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      @media (min-width: 1200px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      @media (min-width: 1536px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      /* Card */
      .prod-media { width: 100%; height: 140px; overflow: hidden; border-radius: .75rem .75rem 0 0; }
      .prod-media.ph {
        display: grid; place-items: center;
        background: repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 10px, #eef0f3 10px, #eef0f3 20px);
        color: #9aa0a6; font-size: 1.5rem;
      }

      .prod-body { padding: .5rem .75rem; }
      .prod-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
      .prod-name { font-weight: 800; }
      .prod-price { color: var(--p-emphasis-medium); font-weight: 700; }
      .prod-desc { margin: .25rem 0 0 0; color: var(--p-text-muted-color); font-size: .9rem; min-height: 2.5em; }

      .prod-footer { display: flex; justify-content: flex-end; padding: 0 .75rem .75rem; }

      /* Botón circular “+” perfectamente centrado */
      .add-btn {
        width: 44px; height: 44px;
        padding: 0;
        display: grid; place-items: center;  /* centra el ícono */
        font-size: 1.1rem; font-weight: 700;
      }
      :host ::ng-deep .add-btn .p-button-icon,
      :host ::ng-deep .add-btn .p-button-icon-left,
      :host ::ng-deep .add-btn .p-button-icon-right {
        margin: 0 !important; /* evita desplazamientos del icono */
      }

      /* Drawer DERECHO */
      :host ::ng-deep .cart-right .p-drawer-content {
        display: flex; flex-direction: column; height: 100%; padding: 0;
      }

      .cart-head {
        position: sticky; top: 0; z-index: 1; background: var(--p-surface-0);
        border-bottom: 1px solid var(--p-surface-200); padding: 0.75rem 1rem;
      }
      .cart-head h3 { margin: 0 0 6px 0; font-size: 1rem; font-weight: 800; }
      .chipset { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }

      .cart-body { padding: 0.75rem 1rem; }
      .row {
        display: grid; grid-template-columns: 140px 1fr; gap: 10px; align-items: center;
        margin-bottom: 8px;
      }

      .qty { display: flex; align-items: center; gap: 8px; }
      .right { text-align: right; }

      .empty { display: flex; align-items: center; gap: .5rem; color: var(--p-text-muted-color); }

      .toolbar {
        position: sticky; bottom: 0; background: var(--p-surface-0);
        border-top: 1px solid var(--p-surface-200); padding: 0.5rem 1rem;
      }
      .totals { display: grid; gap: 4px; margin-bottom: 8px; }
      .totals .line { display: flex; justify-content: space-between; }
      .totals .line.total { color: var(--p-emphasis-high); font-size: 16px; }
      .actions { display: flex; gap: .5rem; justify-content: flex-end; }
      .muted { color: var(--p-text-muted-color); }
    `,
  ],
})
export class OrderFormComponent implements AfterViewInit {
  private store = inject(OrdersStore);
  private router = inject(Router);

  @ViewChild('catsRef') catsRef?: ElementRef<HTMLElement>;

  /** Ancho dinámico del drawer (derecha). En móviles ocupa 100% del ancho. */
  drawerWidth = signal<string>('420px');

  @HostListener('window:resize')
  onResize() { this.recalcDrawerWidth(); }

  ngAfterViewInit(): void { this.recalcDrawerWidth(); }

  private recalcDrawerWidth() {
    try {
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const desktopWidth = Math.min(420, Math.round(vw * 0.38));
      const w = vw <= 768 ? '100vw' : `${desktopWidth}px`;
      this.drawerWidth.set(w);
    } catch {}
  }

  /** Catálogo (sin imágenes reales) con más productos por categoría */
  allProducts: Product[] = [
    // SOPAS
    { id: 'sopa-mani',  name: 'Sopa de Maní',    qty: 1, price: 18, description: 'Breve descripción del producto' },
    { id: 'sopa-fideo', name: 'Sopa de Fideo',   qty: 1, price: 15, description: 'Breve descripción del producto' },
    { id: 'sopa-verd',  name: 'Sopa de Verduras',qty: 1, price: 16, description: 'Breve descripción del producto' },
    { id: 'sopa-crema', name: 'Crema de Zapallo',qty: 1, price: 17, description: 'Breve descripción del producto' },
    // BEBIDAS
    { id: 'mini-coca',  name: 'Mini Coca',       qty: 1, price: 8,  description: 'Breve descripción del producto' },
    { id: 'coca-2l',    name: 'Coca 2lt',        qty: 1, price: 18, description: 'Breve descripción del producto' },
    { id: 'sprite-600', name: 'Sprite 600ml',    qty: 1, price: 9,  description: 'Breve descripción del producto' },
    { id: 'agua-600',   name: 'Agua 600ml',      qty: 1, price: 7,  description: 'Breve descripción del producto' },
    // PARRILLA
    { id: 'bife',       name: 'Bife de Chorizo', qty: 1, price: 55, description: 'Breve descripción del producto' },
    { id: 'tira',       name: 'Asado de Tira',   qty: 1, price: 48, description: 'Breve descripción del producto' },
    { id: 'pollo',      name: 'Pechuga a la Parrilla', qty: 1, price: 36, description: 'Breve descripción del producto' },
    { id: 'chori',      name: 'Chorizo',         qty: 1, price: 15, description: 'Breve descripción del producto' },
  ];

  categories: Category[] = [
    { key: 'SOPAS',    label: 'SOPAS',    productIds: ['sopa-mani', 'sopa-fideo', 'sopa-verd', 'sopa-crema'] },
    { key: 'BEBIDAS',  label: 'BEBIDAS',  productIds: ['mini-coca', 'coca-2l', 'sprite-600', 'agua-600'] },
    { key: 'PARRILLA', label: 'PARRILLA', productIds: ['bife', 'tira', 'pollo', 'chori'] },
  ];

  activeKey = signal<string>(this.categories[0].key);

  setActive(key: string) { this.activeKey.set(key); }

  activeLabel = computed(() => this.categories.find(c => c.key === this.activeKey())?.label || '');

  byCategory = (key: string) =>
    this.allProducts.filter(p => this.categories.find(c => c.key === key)?.productIds.includes(p.id));

  currentProducts = () => this.byCategory(this.activeKey());

  // ===== Carrito
  items = signal<OrderItem[]>([]);
  itemsCount = computed(() => this.items().reduce((a, b) => a + b.qty, 0));

  typeOptions: { label: string; value: 'MESA' | 'LLEVAR' }[] = [
    { label: 'Mesa', value: 'MESA' },
    { label: 'Llevar', value: 'LLEVAR' }
  ];

  type: 'MESA' | 'LLEVAR' = 'MESA';
  table: number | null = 1;
  customer = '';
  discount = 0;

  cartOpen = false;
  toggleCart(v: boolean) { this.cartOpen = v; }

  total() {
    const sum = this.items().reduce((acc, it) => acc + it.price * it.qty, 0);
    return Math.max(0, sum - this.discount);
  }

  addItem(p: Product) {
    const list = [...this.items()];
    const idx = list.findIndex(x => x.id === p.id);
    if (idx >= 0) list[idx] = { ...list[idx], qty: list[idx].qty + 1 };
    else list.push({ id: p.id, name: p.name, qty: 1, price: p.price }); // solo guardo lo necesario en carrito
    this.items.set(list);
  }
  inc(i: number) {
    const l = [...this.items()];
    l[i] = { ...l[i], qty: l[i].qty + 1 };
    this.items.set(l);
  }
  dec(i: number) {
    const l = [...this.items()];
    l[i] = { ...l[i], qty: Math.max(1, l[i].qty - 1) };
    this.items.set(l);
  }
  remove(i: number) {
    const l = [...this.items()];
    l.splice(i, 1);
    this.items.set(l);
  }

  save() {
    this.store.addOrder({
      customer: this.customer || undefined,
      type: this.type,
      table: this.type === 'MESA' ? this.table ?? 1 : null,
      items: this.items(),
    });
    this.router.navigateByUrl('/orders');
  }
  cancel() { this.router.navigateByUrl('/orders'); }
}88888
