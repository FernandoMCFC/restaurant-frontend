import { Component, HostListener, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/* PrimeNG v20 */
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';

import { OrdersStore } from '../../pages/orders/orders.store';
import { OrderItem } from '../../pages/orders/orders.types';
import { ProductAddComponent } from './product-add.component';

type Category = { key: string; label: string; productIds: string[] };
type Product = OrderItem & { description?: string; imageUrl?: string };

@Component({
  selector: 'app-order-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, DrawerModule, OverlayBadgeModule, TableModule, DividerModule, ToolbarModule,
    ProductAddComponent
  ],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="topbar">
        <h1>Nuevo Pedido</h1>
        <p-overlaybadge [value]="itemsCount()" severity="info" styleClass="cart-badge">
          <button pButton class="p-button-rounded p-button-text cart-btn"
                  icon="pi pi-shopping-cart"
                  (click)="toggleCart(true)"
                  aria-label="Resumen de pedido"></button>
        </p-overlaybadge>
      </div>

      <!-- Categorías -->
      <div class="cats">
        <a *ngFor="let c of categories"
           (click)="setActive(c.key)"
           [class.active]="activeKey() === c.key">{{ c.label }}</a>
      </div>
      <div class="sep"></div>

      <!-- Grid productos -->
      <div class="list-area">
        <div class="grid">
          <div class="product-card" *ngFor="let p of currentProducts()">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-pad">
                  <div class="prod-media">
                    <img *ngIf="p.imageUrl; else ph" [src]="p.imageUrl!" alt="{{ p.name }}">
                    <ng-template #ph>
                      <div class="ph"><i class="pi pi-image"></i></div>
                    </ng-template>
                  </div>
                </div>
              </ng-template>

              <div class="prod-body">
                <div class="prod-name">{{ p.name }}</div>
                <div class="price-row">
                  <div class="prod-price">{{ p.price | number:'1.2-2' }} Bs</div>
                  <button pButton class="add-btn" icon="pi pi-plus" [text]="false"
                          (click)="openAddModal(p)"
                          [ariaLabel]="'Agregar ' + p.name"></button>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      </div>

      <!-- Modal agregar/editar (se crea y destruye en cada apertura) -->
      <ng-container *ngIf="showAddModal">
        <app-product-add
          [visible]="true"
          [product]="selectedProduct || undefined"
          [initialQty]="initialQty"
          (confirm)="onConfirmAdd($event)"
          (visibleChange)="handleModalVisible($event)">
        </app-product-add>
      </ng-container>

      <!-- Drawer carrito -->
      <p-drawer
        [(visible)]="cartOpen"
        position="right"
        [modal]="true"
        [showCloseIcon]="true"
        [blockScroll]="true"
        [dismissible]="true"
        [style]="{ width: 'min(420px, 90vw)' }"
      >
        <ng-template pTemplate="header">
          <div class="cart-head">
            <h3>Resumen de pedido</h3>
            <span class="muted">Items: {{ itemsCount() }}</span>
          </div>
        </ng-template>

        <div class="cart-body">
          <div *ngIf="items().length; else empty">
            <p-table
              [value]="items()"
              [tableStyle]="{ 'min-width': '100%' }"
              [scrollable]="true"
              scrollHeight="260px">
              <ng-template pTemplate="header">
                <tr>
                  <th>Producto</th>
                  <th style="width:110px; text-align:center;">Cant.</th>
                  <th style="width:120px">Precio</th>
                  <th style="width:72px"></th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-row let-i="rowIndex">
                <tr>
                  <td>
                    <div class="item-name">{{ row.name }}</div>
                    <!-- (se eliminó "Unit: ...") -->
                  </td>

                  <!-- Cantidad sin +/- -->
                  <td class="center">
                    <span class="qty-chip">{{ row.qty }}</span>
                  </td>

                  <td class="right">{{ row.qty * row.price | number:'1.2-2' }} Bs</td>

                  <!-- Acciones -->
                  <td class="right actions-cell">
                    <button pButton icon="pi pi-pencil"
                            class="p-button-text"
                            (click)="openEditModal(i)"
                            aria-label="Editar"></button>

                    <button pButton icon="pi pi-times"
                            class="p-button-text"
                            (click)="remove(i)"
                            aria-label="Eliminar"></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <ng-template #empty>
            <div class="empty"><i class="pi pi-inbox"></i><span>Sin productos</span></div>
          </ng-template>

          <p-divider></p-divider>

          <div class="toolbar">
            <div class="totals">
              <div class="line total">
                <span>Total</span>
                <span>{{ total() | number:'1.2-2' }} Bs</span>
              </div>
            </div>
            <div class="actions">
              <button pButton label="Cancelar" severity="secondary" (click)="toggleCart(false)"></button>
              <button pButton label="Guardar" icon="pi pi-check" (click)="save()"></button>
            </div>
          </div>
        </div>
      </p-drawer>
    </div>
  `,
  styles: [`
    :host{ display:block; overflow-x:hidden; }

    .page{
      display:grid; grid-template-rows:auto auto 1px auto; gap:.5rem;
      padding: 0 12px 12px; box-sizing:border-box;
    }

    .topbar{ display:flex; align-items:center; justify-content:space-between; }
    .topbar h1{ margin:0; font-size:22px; font-weight:700; line-height:1.1; }
    .cart-btn{ font-size:1.4rem; }
    .cart-badge .p-badge{
      background: var(--p-primary-color) !important; color: var(--p-primary-contrast-color) !important;
      min-width: 1.25rem; height: 1.25rem; font-size:.75rem; font-weight:700; transform: translate(2px,-2px);
    }

    .cats{ display:flex; gap:12px; overflow-x:auto; padding:6px 0 8px; }
    .cats a{ white-space:nowrap; font-weight:700; color:var(--p-emphasis-medium); text-decoration:none; padding:0 2px 6px; }
    .cats a.active{ color:var(--p-primary-color); border-bottom:2px solid var(--p-primary-color); }
    .sep{ height:1px; background:var(--p-surface-200); margin:0 0 6px; }

    .list-area{ overflow:visible; }
    .grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.75rem; width:100%; }
    @media (min-width: 1200px){ .grid{ grid-template-columns: repeat(4, minmax(0,1fr)); } }
    .product-card, .product-card *{ min-width:0; }

    .card-pad{ padding:.5rem .5rem 0 .5rem; }
    .prod-media{
      width:100%; aspect-ratio:4/3; border-radius:var(--p-border-radius); overflow:hidden;
      background:var(--p-surface-100); display:grid; place-items:center;
    }
    .prod-media .ph{ width:100%; height:100%; display:grid; place-items:center;
      background:repeating-linear-gradient(45deg,var(--p-surface-100),var(--p-surface-100) 12px,var(--p-surface-200) 12px,var(--p-surface-200) 24px);
      color:var(--p-text-muted-color); font-size:1.25rem;
    }
    .prod-body{ padding:.5rem; display:grid; gap:.45rem; }
    .prod-name{ font-weight:700; line-height:1.25; word-break:break-word; }
    .price-row{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
    .prod-price{ font-weight:700; }

    .add-btn.p-button{ width:40px; height:40px; border-radius:9999px; padding:0; display:inline-flex; align-items:center; justify-content:center; }

    .cart-head{ position:sticky; top:0; z-index:1; background:var(--p-surface-0); border-bottom:1px solid var(--p-surface-200); padding:.75rem 1rem; }
    .cart-head h3{ margin:0 0 6px; font-size:1rem; font-weight:800; }
    .cart-body{ padding:.75rem 1rem; }
    .right{ text-align:right; }
    .center{ text-align:center; }
    .qty-chip{
      display:inline-block; min-width:2rem; padding:.25rem .5rem; border-radius:9999px;
      background:var(--p-surface-200); font-weight:700;
    }
    .actions-cell .p-button{ margin-left:.25rem; }

    .empty{ display:flex; align-items:center; gap:.5rem; color:var(--p-text-muted-color); }
    .toolbar{ position:sticky; bottom:0; background:var(--p-surface-0); border-top:1px solid var(--p-surface-200); padding:.5rem 1rem; }
    .totals .line{ display:flex; justify-content:space-between; }
    .totals .line.total{ font-size:16px; font-weight:700; }
    .actions{ display:flex; gap:.5rem; justify-content:flex-end; }
    .muted{ color:var(--p-text-muted-color); }
  `]
})
export class OrderFormComponent {
  private router = inject(Router);
  private store = inject(OrdersStore);

  /** Catálogo demo */
  allProducts: Product[] = [
    { id: 'sopa-mani',  name: 'Sopa de Maní',    qty: 1, price: 8 },
    { id: 'sopa-fideo', name: 'Sopa de Fideo',   qty: 1, price: 15 },
    { id: 'sopa-verd',  name: 'Sopa de Verduras',qty: 1, price: 16 },
    { id: 'sopa-crema', name: 'Crema de Zapallo',qty: 1, price: 17 },
    { id: 'mini-coca',  name: 'Mini Coca',       qty: 1, price: 8  },
    { id: 'coca-2l',    name: 'Coca 2lt',        qty: 1, price: 18 },
    { id: 'sprite-600', name: 'Sprite 600ml',    qty: 1, price: 9  },
    { id: 'agua-600',   name: 'Agua 600ml',      qty: 1, price: 7  },
    { id: 'bife',       name: 'Bife de Chorizo', qty: 1, price: 55 },
    { id: 'tira',       name: 'Asado de Tira',   qty: 1, price: 48 },
    { id: 'pollo',      name: 'Pechuga a la Parrilla', qty: 1, price: 36 },
    { id: 'chori',      name: 'Chorizo',         qty: 1, price: 15 },
  ];

  categories: Category[] = [
    { key: 'SOPAS',    label: 'SOPAS',    productIds: ['sopa-mani','sopa-fideo','sopa-verd','sopa-crema'] },
    { key: 'BEBIDAS',  label: 'BEBIDAS',  productIds: ['mini-coca','coca-2l','sprite-600','agua-600'] },
    { key: 'PARRILLA', label: 'PARRILLA', productIds: ['bife','tira','pollo','chori'] },
  ];

  activeKey = signal<string>(this.categories[0].key);
  setActive(key: string){ this.activeKey.set(key); }
  byCategory = (key: string) => this.allProducts.filter(p => this.categories.find(c => c.key === key)?.productIds.includes(p.id));
  currentProducts = () => this.byCategory(this.activeKey());

  /* Carrito */
  items = signal<OrderItem[]>([]);
  itemsCount = computed(() => this.items().reduce((a, it) => a + it.qty, 0));
  cartOpen = false;

  toggleCart(v: boolean){ this.cartOpen = v; }
  total(){ return this.items().reduce((acc, it) => acc + it.qty * it.price, 0); }

  addItem(p: Product){
    const l = [...this.items()];
    const i = l.findIndex(x => x.id === p.id);
    if (i >= 0) l[i] = { ...l[i], qty: l[i].qty + 1 };
    else l.push({ id: p.id, name: p.name, qty: 1, price: p.price });
    this.items.set(l);
  }
  private addItemWithQty(p: Product, qty: number){
    const l = [...this.items()];
    const i = l.findIndex(x => x.id === p.id);
    const q = Math.max(1, qty | 0);
    if (i >= 0) l[i] = { ...l[i], qty: l[i].qty + q };
    else l.push({ id: p.id, name: p.name, qty: q, price: p.price });
    this.items.set(l);
  }
  inc(i: number){ const l = [...this.items()]; l[i] = { ...l[i], qty: l[i].qty + 1 }; this.items.set(l); }
  dec(i: number){ const l = [...this.items()]; l[i] = { ...l[i], qty: Math.max(1, l[i].qty - 1) }; this.items.set(l); }
  remove(i: number){ const l = [...this.items()]; l.splice(i,1); this.items.set(l); }

  /* ===== Modal agregar/editar ===== */
  showAddModal = false;
  selectedProduct: Product | null = null;
  initialQty = 1;
  private editingIndex: number | null = null;

  openAddModal(p: Product){
    this.cartOpen = false;
    this.selectedProduct = { ...p };   // clonar para forzar cambio de @Input
    this.initialQty = 1;
    this.editingIndex = null;
    setTimeout(() => this.showAddModal = true, 0); // crear modal en siguiente tick
  }

  openEditModal(index: number){
    const item = this.items()[index];
    const prod = this.allProducts.find(x => x.id === item.id);
    if (!prod) return;
    this.cartOpen = false;
    this.selectedProduct = { ...prod };
    this.initialQty = item.qty;
    this.editingIndex = index;
    setTimeout(() => this.showAddModal = true, 0);
  }

  onConfirmAdd(e: { productId: string; qty: number; notes?: string }){
    const p = this.allProducts.find(x => x.id === e.productId);
    if (!p) return;

    if (this.editingIndex !== null) {
      const l = [...this.items()];
      if (l[this.editingIndex] && l[this.editingIndex].id === e.productId) {
        l[this.editingIndex] = { ...l[this.editingIndex], qty: Math.max(1, e.qty | 0) };
        this.items.set(l);
      }
      this.editingIndex = null;
    } else {
      this.addItemWithQty(p, e.qty);
    }

    this.showAddModal = false;  // (visibleChange también lo apagará)
    this.selectedProduct = null;
  }

  /** Recibe el visibleChange del modal para destruirlo (por el *ngIf) */
  handleModalVisible(v: boolean){
    if (!v) {
      this.showAddModal = false;
      this.selectedProduct = null;
      this.editingIndex = null;
    }
  }

  /* Pedido */
  customer = '';
  type: 'MESA' | 'LLEVAR' = 'MESA';
  table: number | null = 1;

  @HostListener('window:resize') onResize(){}

  save(){
    this.store.addOrder({
      customer: this.customer || undefined,
      type: this.type,
      table: this.type === 'MESA' ? this.table ?? 1 : null,
      items: this.items(),
    });
    this.router.navigateByUrl('/orders');
  }
  cancel(){ this.router.navigateByUrl('/orders'); }
}
