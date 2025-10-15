// src/app/components/orders/order-form.component.ts
import { Component, HostListener, ViewEncapsulation, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/* PrimeNG v20 */
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';

import { OrdersStore } from '../../pages/orders/orders.store';
import { OrderItem, ItemStatus } from '../../pages/orders/orders.types';
import { ProductAddComponent } from './product-add.component';
import { CartDrawerComponent } from './cart-drawer.component';

type Category = { key: string; label: string; productIds: string[] };
type Product = Omit<OrderItem, 'itemStatus' | 'notes'> & { description?: string; imageUrl?: string };

@Component({
  selector: 'app-order-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, NgIf, NgForOf,
    FormsModule,
    ButtonModule, CardModule, DrawerModule, OverlayBadgeModule, TableModule, DividerModule, ToolbarModule,
    ProductAddComponent, CartDrawerComponent
  ],
  template: `
    <div class="page">
      <!-- Header (alineado al de Orders) -->
      <header class="header">
        <div class="title-line">
          <div class="title-left">
            <span class="title-icon pi pi-list-check" aria-hidden="true"></span>
            <h1>{{ editingOrderId() ? 'Editar Pedido' : 'Nuevo Pedido' }}</h1>
          </div>

          <p-overlaybadge [value]="itemsCount()" severity="info" styleClass="cart-badge">
            <button pButton class="p-button-rounded p-button-text cart-btn"
                    icon="pi pi-shopping-cart"
                    (click)="toggleCart(true)"
                    aria-label="Resumen de pedido"></button>
          </p-overlaybadge>
        </div>
      </header>

      <!-- Categorías (scroll visible igual a orders-list) -->
      <div class="cats-scroll">
        <div class="cats-container">
          <a *ngFor="let c of categories"
             (click)="setActive(c.key)"
             [class.active]="activeKey() === c.key">{{ c.label }}</a>
        </div>
      </div>
      <div class="sep"></div>

      <!-- Grid productos CON SCROLL -->
      <div class="products-scroll-container">
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

      <!-- Modal agregar/editar -->
      <ng-container *ngIf="showAddModal">
        <app-product-add
          [visible]="true"
          [product]="selectedProduct || undefined"
          [initialQty]="initialQty"
          [showStatus]="modalShowStatus"
          [initialStatus]="modalInitialStatus"
          (confirm)="onConfirmAdd($event)"
          (visibleChange)="handleModalVisible($event)">
        </app-product-add>
      </ng-container>

      <!-- Drawer carrito (igual que antes) -->
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
  styles: [`
    :host{ display:block; overflow-x:hidden; }

    /* === Layout con fila scrolleable interna === */
    .page{
      display:grid;
      grid-template-rows: auto auto 1px 1fr; /* header, categorías, separador, productos (scrolleable) */
      gap:.5rem;
      height: 100vh;
      padding:16px;
      box-sizing:border-box;
    }
    @media (max-width:639.98px){ .page{ padding:12px; } }

    /* ===== Header ===== */
    .header{ margin-bottom:4px; }
    .title-line{
      display:flex; align-items:flex-end; justify-content:space-between; gap:12px;
      position:relative; padding-bottom:.25rem;
    }
    .title-line::after{
      content:""; position:absolute; left:0; right:0; bottom:0; height:2px;
      background: linear-gradient(90deg, var(--p-surface-300), transparent 60%);
    }
    .title-left{ display:flex; align-items:center; gap:.75rem; min-height:48px; }
    .title-icon{
      width:34px; height:34px; border-radius:10px;
      display:inline-flex; align-items:center; justify-content:center;
      background: var(--p-surface-100); color: var(--p-primary-600);
      border:1px solid var(--p-surface-300); box-shadow: 0 1px 4px rgba(0,0,0,.04);
      font-size:1rem;
    }
    h1{ margin:0; line-height:1; font-size:24px; font-weight:800; letter-spacing:.2px; color:var(--p-emphasis-high); }

    .cart-btn{ font-size:1.4rem; }
    .cart-badge .p-badge{
      background: var(--p-primary-color) !important;
      color: var(--p-primary-contrast-color) !important;
      min-width: 1.25rem; height: 1.25rem; font-size:.75rem; font-weight:700;
      transform: none;
      border: 2px solid var(--p-surface-0);
      box-shadow: 0 0 0 2px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.15);
      z-index: 1;
    }

    /* ===== Categorías ===== */
    .cats-scroll{
      overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch;
      scrollbar-width:thin;
      padding:4px 4px 12px 4px;
      margin:0 -4px;
    }
    .cats-container{ display:flex; gap:12px; padding:4px; min-width:min-content; }

    .cats-container a{
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.5rem .9rem;
      border-radius:999px;
      border:1.5px solid var(--p-surface-300);
      background: var(--p-surface-0);
      color: var(--p-emphasis-medium);
      font-weight:700; letter-spacing:.2px;
      text-decoration:none; white-space:nowrap;
      user-select:none; cursor:pointer;
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease, color .2s ease;
    }
    .cats-container a:hover{
      transform: translateY(-1px);
      border-color: var(--p-primary-300);
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
      color: var(--p-emphasis-high);
    }
    .cats-container a.active{
      background: linear-gradient(180deg, var(--p-primary-50), var(--p-primary-100));
      color: var(--p-primary-800);
      border-color: var(--p-primary-400);
      box-shadow: 0 4px 14px rgba(0,0,0,.10), 0 2px 0 rgba(0,0,0,.02) inset;
    }

    .sep{ height:1px; background:var(--p-surface-200); margin:0 0 6px; }

    /* ===== Contenedor con scroll para productos ===== */
    .products-scroll-container{
      min-height:0;
      overflow-y:auto;
      overflow-x:hidden;
      padding-right:4px;
      padding-bottom:16px;
      scroll-padding-bottom:16px;
    }
    .products-scroll-container::-webkit-scrollbar{ width:6px; }
    .products-scroll-container::-webkit-scrollbar-track{ background: var(--p-surface-100); border-radius:3px; }
    .products-scroll-container::-webkit-scrollbar-thumb{ background: var(--p-surface-300); border-radius:3px; }
    .products-scroll-container::-webkit-scrollbar-thumb:hover{ background: var(--p-surface-400); }

    /* ===== Grid de productos ===== */
    .grid{
      display:grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap:.75rem;
      width:100%;
    }
    .grid::after{
      content:"";
      height: calc(80px + env(safe-area-inset-bottom, 0px));
      grid-column: 1 / -1;
    }
    @media (min-width: 768px){ .grid{ grid-template-columns: repeat(3, minmax(0,1fr)); } }
    @media (min-width: 1200px){ .grid{ grid-template-columns: repeat(4, minmax(0,1fr)); } }

    .product-card, .product-card *{ min-width:0; }
    .product-card .p-card{ height:100%; }

    .card-pad{ padding:.5rem .5rem 0 .5rem; }
    .prod-media{
      width:100%; aspect-ratio:4/3; border-radius:var(--p-border-radius); overflow:hidden;
      background:var(--p-surface-100); display:grid; place-items:center;
    }
    .prod-media .ph{
      width:100%; height:100%; display:grid; place-items:center;
      background:repeating-linear-gradient(45deg,var(--p-surface-100) 0px,var(--p-surface-100) 12px,var(--p-surface-200) 12px,var(--p-surface-200) 24px);
      color:var(--p-text-muted-color); font-size:1.25rem;
    }
    .prod-body{ padding:.5rem; display:grid; gap:.45rem; }
    .prod-name{ font-weight:700; line-height:1.25; word-break:break-word; }
    .price-row{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
    .prod-price{ font-weight:700; }

    .add-btn.p-button{ width:40px; height:40px; border-radius:9999px; padding:0; display:inline-flex; align-items:center; justify-content:center; }

    /* ===== MOBILE: tarjetas pegadas a los bordes laterales ===== */
    @media (max-width: 639.98px){
      /* Hacemos bleed lateral del contenedor para compensar el padding de .page (12px) */
      .products-scroll-container{
        margin-left:-12px;
        margin-right:-12px;
        padding-left:0;
        padding-right:0;
      }
      .grid{
        grid-template-columns: repeat(2, 1fr);
        gap:6px; /* separación mínima entre tarjetas */
      }
      /* Evitar márgenes colapsados de la tarjeta */
      .product-card{ margin:0; }
    }
  `]
})
export class OrderFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(OrdersStore);

  /** ID si estamos editando */
  editingOrderId = signal<string | null>(null);

  /** Catálogo demo - 8 por categoría */
  allProducts: Product[] = [
    // SOPAS - 8
    { id: 'sopa-mani',  name: 'Sopa de Maní',        qty: 1, price: 8 },
    { id: 'sopa-fideo', name: 'Sopa de Fideo',       qty: 1, price: 15 },
    { id: 'sopa-verd',  name: 'Sopa de Verduras',    qty: 1, price: 16 },
    { id: 'sopa-crema', name: 'Crema de Zapallo',    qty: 1, price: 17 },
    { id: 'sopa-tomate', name: 'Crema de Tomate',    qty: 1, price: 18 },
    { id: 'sopa-cebolla', name: 'Sopa de Cebolla',   qty: 1, price: 14 },
    { id: 'sopa-lentejas', name: 'Sopa de Lentejas', qty: 1, price: 16 },
    { id: 'sopa-pollo', name: 'Caldo de Pollo',      qty: 1, price: 15 },

    // BEBIDAS - 8
    { id: 'mini-coca',  name: 'Mini Coca',           qty: 1, price: 8  },
    { id: 'coca-2l',    name: 'Coca 2lt',            qty: 1, price: 18 },
    { id: 'sprite-600', name: 'Sprite 600ml',        qty: 1, price: 9  },
    { id: 'agua-600',   name: 'Agua 600ml',          qty: 1, price: 7  },
    { id: 'fanta-600',  name: 'Fanta 600ml',         qty: 1, price: 9  },
    { id: 'jugo-naranja', name: 'Jugo de Naranja',   qty: 1, price: 12 },
    { id: 'limonada',   name: 'Limonada Natural',    qty: 1, price: 10 },
    { id: 'cafe',       name: 'Café Americano',      qty: 1, price: 8 },

    // PARRILLA - 8
    { id: 'bife',       name: 'Bife de Chorizo',     qty: 1, price: 55 },
    { id: 'tira',       name: 'Asado de Tira',       qty: 1, price: 48 },
    { id: 'pollo',      name: 'Pechuga a la Parrilla', qty: 1, price: 36 },
    { id: 'chori',      name: 'Chorizo',             qty: 1, price: 15 },
    { id: 'costilla',   name: 'Costilla de Cerdo',   qty: 1, price: 42 },
    { id: 'lomo',       name: 'Lomo de Res',         qty: 1, price: 60 },
    { id: 'picanha',    name: 'Picanha',             qty: 1, price: 52 },
    { id: 'salchichas', name: 'Salchichas Parrilleras', qty: 1, price: 18 },
  ];

  categories: Category[] = [
    { key: 'SOPAS',    label: 'SOPAS',    productIds: ['sopa-mani','sopa-fideo','sopa-verd','sopa-crema','sopa-tomate','sopa-cebolla','sopa-lentejas','sopa-pollo'] },
    { key: 'BEBIDAS',  label: 'BEBIDAS',  productIds: ['mini-coca','coca-2l','sprite-600','agua-600','fanta-600','jugo-naranja','limonada','cafe'] },
    { key: 'PARRILLA', label: 'PARRILLA', productIds: ['bife','tira','pollo','chori','costilla','lomo','picanha','salchichas'] },
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

  private addItemWithQty(p: Product, qty: number){
    const l = [...this.items()];
    const i = l.findIndex(x => x.id === p.id);
    const q = Math.max(1, qty | 0);
    if (i >= 0) l[i] = { ...l[i], qty: l[i].qty + q };
    else l.push({ id: p.id, name: p.name, qty: q, price: p.price, notes: '', itemStatus: 'EN_PREPARACION' });
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

  // controles del Select de estado en el modal
  modalShowStatus = false;
  modalInitialStatus: ItemStatus | undefined = undefined;

  private mountModal(product: Product, qty: number, editIndex: number | null){
    this.showAddModal = false;
    this.selectedProduct = { ...product };
    this.initialQty = Math.max(1, qty | 0);
    this.editingIndex = editIndex;

    if (editIndex !== null) {
      this.modalShowStatus = true;
      this.modalInitialStatus = this.items()[editIndex]?.itemStatus ?? 'EN_PREPARACION';
    } else {
      this.modalShowStatus = false;
      this.modalInitialStatus = undefined;
    }
    setTimeout(() => { this.showAddModal = true; }, 0);
  }

  openAddModal(p: Product){ this.mountModal(p, 1, null); }

  openEditModal(index: number){
    const item = this.items()[index];
    const prod = this.allProducts.find(x => x.id === item.id);
    if (!prod) return;
    this.mountModal(prod, item.qty, index);
  }

  onConfirmAdd(e: { productId: string; qty: number; notes?: string; itemStatus?: ItemStatus }){
    const p = this.allProducts.find(x => x.id === e.productId);
    if (!p) return;

    if (this.editingIndex !== null) {
      const l = [...this.items()];
      if (l[this.editingIndex] && l[this.editingIndex].id === e.productId) {
        l[this.editingIndex] = {
          ...l[this.editingIndex],
          qty: Math.max(1, e.qty | 0),
          notes: e.notes ?? l[this.editingIndex].notes ?? '',
          itemStatus: (e.itemStatus ?? l[this.editingIndex].itemStatus ?? 'EN_PREPARACION')
        };
        this.items.set(l);
      }
      this.editingIndex = null;
    } else {
      this.addItemWithQty(p, e.qty);
    }

    this.showAddModal = false;
    }
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

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(qp => {
      const id = qp.get('edit');
      const open = qp.get('open') ?? qp.get('openCart');

      this.editingOrderId.set(id);

      if (id) {
        const order = this.store.getById(id!);
        if (order) {
          this.items.set(order.items ?? []);
          this.customer = order.customer ?? '';
          this.type = order.type;
          this.table = this.type === 'MESA' ? (order.table ?? 1) : null;
        }
      }

      if (open === '1') this.toggleCart(true);
    });
  }

  save(){
    const payload = {
      customer: this.customer || undefined,
      type: this.type,
      table: this.type === 'MESA' ? (this.table ?? 1) : null,
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

  cancel(){ this.router.navigateByUrl('/orders'); }
}
