// src/app/components/orders/order-form.component.ts
import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/* PrimeNG v20 */
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

import { OrdersStore } from '../../pages/orders/orders.store';
import { CategoriesStore } from '../../pages/categories/categories.store';
import { ProductsStore } from '../../pages/products/products.store';
import { OrderItem, ItemStatus } from '../../pages/orders/orders.types';
import { ProductAddComponent } from './product-add.component';
import { CartDrawerComponent } from './cart-drawer.component';

type Category = { key: string; label: string };
type Product = Omit<OrderItem, 'itemStatus' | 'notes'> & {
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  visibleForClients?: boolean;
};

@Component({
  selector: 'app-order-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    ButtonModule,
    CardModule,
    DrawerModule,
    OverlayBadgeModule,
    ProductAddComponent,
    CartDrawerComponent,
  ],
  template: `
    <div class="page">
      <!-- Header -->
      <header class="header">
        <div class="title-line">
          <div class="title-left">
            <span class="title-icon pi pi-list-check" aria-hidden="true"></span>
            <h1>{{ editingOrderId() ? 'Editar Pedido' : 'Nuevo Pedido' }}</h1>
          </div>

          <p-overlaybadge
            [value]="itemsCount()"
            severity="info"
            styleClass="cart-badge"
          >
            <button
              pButton
              class="p-button-rounded p-button-text cart-btn"
              icon="pi pi-shopping-cart"
              (click)="toggleCart(true)"
              aria-label="Resumen de pedido"
            ></button>
          </p-overlaybadge>
        </div>
      </header>

      <!-- Categorías -->
      <div class="cats-scroll">
        <div class="cats-container">
          <a
            *ngFor="let c of categories"
            (click)="setActive(c.key)"
            [class.active]="activeKey() === c.key"
            >{{ c.label }}</a
          >
        </div>
      </div>
      <div class="sep"></div>

      <!-- Productos (con scroll) -->
      <div class="products-scroll-container">
        <div class="grid">
          <div class="product-card" *ngFor="let p of currentProducts()">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-pad">
                  <div class="prod-media">
                    <img
                      *ngIf="p.imageUrl; else ph"
                      [src]="p.imageUrl!"
                      alt="{{ p.name }}"
                    />
                    <ng-template #ph>
                      <div class="ph">
                        <i class="pi pi-image"></i>
                      </div>
                    </ng-template>
                  </div>
                </div>
              </ng-template>

              <div class="prod-body">
                <div class="prod-name">{{ p.name }}</div>

                <!-- 20 caracteres + ... -->
                <div class="prod-desc" *ngIf="p.description">
                  {{
                    p.description.length > 20
                      ? (p.description | slice : 0 : 20) + '...'
                      : p.description
                  }}
                </div>

                <div class="price-row">
                  <div class="prod-price">
                    {{ p.price | number : '1.2-2' }} Bs
                  </div>
                  <button
                    pButton
                    class="add-btn"
                    icon="pi pi-plus"
                    [text]="false"
                    (click)="openAddModal(p)"
                    [ariaLabel]="'Agregar ' + p.name"
                  ></button>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      </div>

      <!-- Modal agregar/editar -->
      <ng-container *ngIf="showAddModal">
        <app-product-add
          [visible]="true"
          [product]="selectedProduct || undefined"
          [initialQty]="initialQty"
          [showStatus]="modalShowStatus"
          [initialStatus]="modalInitialStatus"
          (confirm)="onConfirmAdd($event)"
          (visibleChange)="handleModalVisible($event)"
        >
        </app-product-add>
      </ng-container>

      <!-- Drawer carrito -->
      <app-cart-drawer
        [(visible)]="cartOpen"
        [items]="items()"
        [itemsCount]="itemsCount()"
        [(customer)]="customer"
        [(type)]="type"
        [(table)]="table"
        (edit)="openEditModal($event)"
        (remove)="remove($event)"
        (cancel)="cancel()"
        (save)="save()"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        overflow-x: hidden;
      }

      .page {
        display: grid;
        grid-template-rows: auto auto 1px 1fr;
        gap: 0.5rem;
        height: 100vh;
        padding: 16px;
        box-sizing: border-box;
      }
      @media (max-width: 639.98px) {
        .page {
          padding: 12px;
        }
      }

      .header {
        margin-bottom: 4px;
      }
      .title-line {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        position: relative;
        padding-bottom: 0.25rem;
      }
      .title-line::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background: linear-gradient(
          90deg,
          var(--p-surface-300),
          transparent 60%
        );
      }
      .title-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-height: 48px;
      }
      .title-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--p-surface-100);
        color: var(--p-primary-600);
        border: 1px solid var(--p-surface-300);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        font-size: 1rem;
      }
      h1 {
        margin: 0;
        line-height: 1;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 0.2px;
        color: var(--p-emphasis-high);
      }

      .cart-btn {
        font-size: 1.4rem;
      }
      .cart-badge .p-badge {
        background: var(--p-primary-color) !important;
        color: var(--p-primary-contrast-color) !important;
        min-width: 1.25rem;
        height: 1.25rem;
        font-size: 0.75rem;
        font-weight: 700;
        border: 2px solid var(--p-surface-0);
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.02),
          0 2px 6px rgba(0, 0, 0, 0.15);
      }

      .cats-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        padding: 4px 4px 12px 4px;
        margin: 0 -4px;
      }
      .cats-container {
        display: flex;
        gap: 12px;
        padding: 4px;
        min-width: min-content;
      }

      .cats-container a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.9rem;
        border-radius: 999px;
        border: 1.5px solid var(--p-surface-300);
        background: var(--p-surface-0);
        color: var(--p-emphasis-medium);
        font-weight: 700;
        letter-spacing: 0.2px;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s,
          border-color 0.2s,
          background 0.2s,
          color 0.2s;
      }
      .cats-container a:hover {
        transform: translateY(-1px);
        border-color: var(--p-primary-300);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        color: var(--p-emphasis-high);
      }
      .cats-container a.active {
        background: linear-gradient(
          180deg,
          var(--p-primary-50),
          var(--p-primary-100)
        );
        color: var(--p-primary-800);
        border-color: var(--p-primary-400);
        box-shadow:
          0 4px 14px rgba(0, 0, 0, 0.1),
          0 2px 0 rgba(0, 0, 0, 0.02) inset;
      }

      .sep {
        height: 1px;
        background: var(--p-surface-200);
        margin: 0 0 6px;
      }

      .products-scroll-container {
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 4px;
        padding-bottom: 16px;
        scroll-padding-bottom: 16px;
      }
      .products-scroll-container::-webkit-scrollbar {
        width: 6px;
      }
      .products-scroll-container::-webkit-scrollbar-track {
        background: var(--p-surface-100);
        border-radius: 3px;
      }
      .products-scroll-container::-webkit-scrollbar-thumb {
        background: var(--p-surface-300);
        border-radius: 3px;
      }
      .products-scroll-container::-webkit-scrollbar-thumb:hover {
        background: var(--p-surface-400);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        width: 100%;
      }
      .grid::after {
        content: '';
        height: calc(80px + env(safe-area-inset-bottom, 0px));
        grid-column: 1 / -1;
      }

      @media (max-width: 1279.98px) {
        .grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 767.98px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }
      }

      .product-card p-card {
        display: block;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
      }

      .card-pad {
        padding: 0.5rem;
      }
      .prod-media {
        border-radius: 10px;
        overflow: hidden;
        background: repeating-linear-gradient(
          -45deg,
          var(--p-surface-100),
          var(--p-surface-100) 12px,
          var(--p-surface-200) 12px,
          var(--p-surface-200) 24px
        );
        position: relative;
      }
      .prod-media img {
        display: block;
        width: 100%;
        height: 160px;
        object-fit: cover;
      }
      .ph {
        width: 100%;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--p-text-muted-color);
        font-size: 1.25rem;
      }

      .prod-body {
        padding: 0.5rem;
        display: grid;
        gap: 0.45rem;
      }
      .prod-name {
        font-weight: 700;
        line-height: 1.25;
        word-break: break-word;
      }

      .prod-desc {
        font-size: 0.85rem;
        color: var(--p-text-muted-color);
        min-height: 1.1em;
      }

      .price-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .prod-price {
        font-weight: 700;
      }

      .add-btn.p-button {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      @media (max-width: 639.98px) {
        .products-scroll-container {
          margin-left: -12px;
          margin-right: -12px;
          padding-left: 0;
          padding-right: 0;
        }
        .product-card {
          margin: 0;
        }
      }
    `,
  ],
})
export class OrderFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(OrdersStore);
  private categoriesStore = inject(CategoriesStore);
  private productsStore = inject(ProductsStore);

  editingOrderId = signal<string | null>(null);
  allProducts: Product[] = [];
  categories: Category[] = [];

  activeKey = signal<string>('');
  setActive(key: string) {
    this.activeKey.set(key);
  }

  byCategory = (key: string) =>
    this.allProducts.filter(
      (p) => p.categoryId === key && p.visibleForClients
    );
  currentProducts = () => this.byCategory(this.activeKey());

  items = signal<OrderItem[]>([]);
  itemsCount = computed(() =>
    this.items().reduce((a, it) => a + it.qty, 0)
  );
  cartOpen = false;

  toggleCart(v: boolean) {
    this.cartOpen = v;
  }

  private addItemWithQty(p: Product, qty: number) {
    const list = [...this.items()];
    const idx = list.findIndex((x) => x.id === p.id);
    const q = Math.max(1, qty | 0);
    if (idx >= 0) list[idx] = { ...list[idx], qty: list[idx].qty + q };
    else
      list.push({
        id: p.id,
        name: p.name,
        qty: q,
        price: p.price,
        notes: '',
        itemStatus: 'EN_PREPARACION',
      });
    this.items.set(list);
  }
  inc(i: number) {
    const list = [...this.items()];
    list[i] = { ...list[i], qty: list[i].qty + 1 };
    this.items.set(list);
  }
  dec(i: number) {
    const list = [...this.items()];
    list[i] = { ...list[i], qty: Math.max(1, list[i].qty - 1) };
    this.items.set(list);
  }
  remove(i: number) {
    const list = [...this.items()];
    list.splice(i, 1);
    this.items.set(list);
  }

  showAddModal = false;
  selectedProduct: Product | null = null;
  initialQty = 1;
  private editingIndex: number | null = null;
  modalShowStatus = false;
  modalInitialStatus: ItemStatus | undefined;

  private mountModal(product: Product, qty: number, editIndex: number | null) {
    this.showAddModal = false;
    this.selectedProduct = { ...product };
    this.initialQty = Math.max(1, qty | 0);
    this.editingIndex = editIndex;

    if (editIndex !== null) {
      this.modalShowStatus = true;
      this.modalInitialStatus =
        this.items()[editIndex]?.itemStatus ?? 'EN_PREPARACION';
    } else {
      this.modalShowStatus = false;
      this.modalInitialStatus = undefined;
    }

    setTimeout(() => (this.showAddModal = true), 0);
  }

  openAddModal(p: Product) {
    this.mountModal(p, 1, null);
  }

  openEditModal(index: number) {
    const item = this.items()[index];
    const prod = this.allProducts.find((x) => x.id === item.id);
    if (!prod) return;
    this.mountModal(prod, item.qty, index);
  }

  onConfirmAdd(e: {
    productId: string;
    qty: number;
    notes?: string;
    itemStatus?: ItemStatus;
  }) {
    const p = this.allProducts.find((x) => x.id === e.productId);
    if (!p) return;

    if (this.editingIndex !== null) {
      const list = [...this.items()];
      if (list[this.editingIndex] && list[this.editingIndex].id === e.productId) {
        list[this.editingIndex] = {
          ...list[this.editingIndex],
          qty: Math.max(1, e.qty | 0),
          notes: e.notes ?? list[this.editingIndex].notes ?? '',
          itemStatus:
            e.itemStatus ??
            list[this.editingIndex].itemStatus ??
            'EN_PREPARACION',
        };
        this.items.set(list);
      }
      this.editingIndex = null;
    } else {
      this.addItemWithQty(p, e.qty);
    }

    this.showAddModal = false;
  }

  handleModalVisible(v: boolean) {
    if (!v) {
      this.showAddModal = false;
      this.selectedProduct = null;
      this.editingIndex = null;
    }
  }

  customer = '';
  type: 'MESA' | 'LLEVAR' = 'MESA';
  table: number | null = 1;

  private loadCatalog(): void {
    const categories = this.categoriesStore
      .itemsSorted()
      .filter((c) => c.visible);

    this.categories = categories.map((c) => ({
      key: c.id,
      label: c.name,
    }));

    if (this.categories.length > 0) {
      const current = this.activeKey();
      const exists = this.categories.some((c) => c.key === current);
      this.activeKey.set(exists ? current : this.categories[0].key);
    } else {
      this.activeKey.set('');
    }

    const products = this.productsStore.products();
    this.allProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      qty: 1,
      price: p.price,
      description: p.description,
      imageUrl:
        p.photos && p.photos.length > 0 ? p.photos[0] : undefined,
      categoryId: p.categoryId,
      visibleForClients: p.visibleForClients,
    }));
  }

  ngOnInit(): void {
    this.loadCatalog();

    this.route.queryParamMap.subscribe((qp) => {
      const id = qp.get('edit');
      const open = qp.get('open') ?? qp.get('openCart');

      this.editingOrderId.set(id);

      if (id) {
        const order = this.store.getById(id);
        if (order) {
          this.items.set(order.items ?? []);
          this.customer = order.customer ?? '';
          this.type = order.type;
          this.table = this.type === 'MESA' ? order.table ?? 1 : null;
        }
      }

      if (open === '1') this.toggleCart(true);
    });
  }

  save() {
    const payload = {
      customer: this.customer || undefined,
      type: this.type,
      table: this.type === 'MESA' ? this.table ?? 1 : null,
      items: this.items(),
    };

    const editId = this.editingOrderId();
    if (editId) {
      this.store.updateOrder(editId, payload as any);
    } else {
      this.store.addOrder(payload as any);
    }

    this.router.navigateByUrl('/orders');
  }

  cancel() {
    this.router.navigateByUrl('/orders');
  }
}
