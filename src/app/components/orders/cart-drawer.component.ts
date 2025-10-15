import { Component, EventEmitter, Input, Output, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* PrimeNG v20 */
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PanelModule } from 'primeng/panel';

export type OrderItem = { id: string; name: string; qty: number; price: number };

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule, FormsModule,
    DrawerModule, TableModule, ButtonModule, DividerModule, ToolbarModule,
    InputTextModule, InputNumberModule, SelectButtonModule, PanelModule
  ],
  template: `
    <p-drawer
      [(visible)]="visible"
      position="right"
      [modal]="true"
      [showCloseIcon]="false"
      [blockScroll]="true"
      [dismissible]="true"
      [style]="{ width: 'min(400px, 92vw)' }"
      styleClass="cart-drawer cd-compact"
      (visibleChange)="visibleChange.emit($event)"
    >
      <!-- Header -->
      <ng-template pTemplate="header">
        <div class="cd-header">
          <div class="cd-title-wrap">
            <div class="cd-title">Resumen de pedido</div>
            <span class="cd-items-badge">{{ itemsCount }} items</span>
          </div>

          <!-- Botón cerrar GRANDE, mismo look que eliminar -->
          <button
            class="icon-btn danger cd-close-fab"
            (click)="visibleChange.emit(false)"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <img [src]="deleteIcon" alt="Cerrar" />
          </button>
        </div>
      </ng-template>

      <div class="cd-body">
        <!-- Datos del pedido -->
        <p-panel header="Datos del pedido" [toggleable]="false" styleClass="cd-panel">
          <div class="cd-form">
            <div class="cd-field">
              <label class="cd-label">Nombre del cliente</label>
              <input
                type="text"
                pInputText
                [(ngModel)]="customerLocal"
                (ngModelChange)="customerChange.emit(customerLocal)"
                placeholder="Ej. Juan Pérez"
                class="cd-input"
              />
            </div>

            <div class="cd-field cd-type-field">
              <label class="cd-label">Tipo</label>
              <div class="cd-type-buttons">
                <button
                  *ngFor="let option of typeOptions"
                  class="cd-type-btn"
                  [class.active]="typeLocal === option.value"
                  (click)="onTypeChange(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="cd-field cd-table-field" *ngIf="typeLocal === 'MESA'">
              <label class="cd-label">N° mesa</label>
              <div class="cd-table-input">
                <p-inputNumber
                  [(ngModel)]="tableLocal"
                  (ngModelChange)="tableChange.emit(tableLocal)"
                  [min]="1"
                  [max]="99"
                  [useGrouping]="false"
                  [showButtons]="true"
                  mode="decimal"
                  inputId="tableNumber"
                ></p-inputNumber>
              </div>
            </div>
          </div>
        </p-panel>

        <!-- Productos -->
        <div class="cd-products">
          <p-table [value]="items" dataKey="id" *ngIf="itemsLength > 0" styleClass="cd-table">
            <ng-template pTemplate="header">
              <tr>
                <th>Producto</th>
                <th class="center" style="width:70px">Cant.</th>
                <th class="right" style="width:110px">Importe</th>
                <th style="width:60px"></th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row let-i="rowIndex">
              <tr>
                <td><div class="cd-name">{{ row.name }}</div></td>
                <td class="center"><span class="cd-qty">{{ row.qty }}</span></td>
                <td class="right cd-money">{{ row.qty * row.price | number:'1.2-2' }} Bs</td>

                <!-- Acciones (mantener imágenes originales) -->
                <td class="right cd-actions">
                  <button class="icon-btn ghost" (click)="edit.emit(i)" aria-label="Editar" title="Editar">
                    <img [src]="editIcon" alt="" />
                  </button>
                  <button class="icon-btn ghost danger" (click)="remove.emit(i)" aria-label="Eliminar" title="Eliminar">
                    <img [src]="deleteIcon" alt="" />
                  </button>
                </td>
              </tr>
            </ng-template>
          </p-table>

        <!-- TOTAL A PAGAR -->
          <div class="cd-total-section" *ngIf="itemsLength > 0">
            <div class="cd-total-main">
              <span class="cd-total-main-label">TOTAL A PAGAR</span>
              <span class="cd-total-main-amount">{{ totalAmount | number:'1.2-2' }} Bs</span>
            </div>
          </div>

          <!-- Vacio -->
          <div class="cd-empty" *ngIf="itemsLength === 0">
            <i class="pi pi-shopping-cart" style="font-size: 1.25rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
            <p>No hay productos en el pedido</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <ng-template pTemplate="footer">
        <div class="cd-footer-buttons">
          <button
            pButton
            label="Cancelar"
            icon="pi pi-times"
            class="p-button-outlined p-button-secondary cd-footer-btn cd-cancel-btn"
            (click)="cancel.emit()"
          ></button>
          <button
            pButton
            label="Guardar"
            icon="pi pi-check"
            class="p-button-success cd-footer-btn cd-save-btn"
            (click)="save.emit()"
            [disabled]="itemsLength === 0"
          ></button>
        </div>
      </ng-template>
    </p-drawer>
  `,
  styles: [`
    :host{ display:block; }

    /* ===== Escala compacta ===== */
    .cd-compact{ font-size:.8rem; }
    .cd-compact .cd-label, .cd-compact .p-panel-title{ font-size:.7rem; }
    .cd-compact .p-inputtext, .cd-compact .p-inputnumber input{ font-size:.8rem; }

    /* ===== Header ===== */
    .cart-drawer .p-drawer-header{
      position: relative; /* para posicionar el botón cerrar */
      padding:.8rem 1rem .7rem 1rem;
      border-bottom:1px solid var(--p-surface-200);
      background:var(--p-surface-0);
    }
    .cd-title-wrap{
      width:100%;
      display:flex; align-items:center; justify-content:space-between; gap:.5rem;
    }
    .cd-title{ font-weight:800; font-size:1.05rem; color:var(--p-emphasis-high); }
    .cd-items-badge{
      font-size:.75rem; font-weight:700; padding:.18rem .5rem; border-radius:999px;
      background:color-mix(in srgb, var(--p-primary-color), white 85%);
      color:var(--p-primary-700, var(--p-primary-color));
    }

    /* Botones base */
    .icon-btn{
      display:inline-flex; align-items:center; justify-content:center;
      width:28px; height:28px; padding:0; border:0; background:transparent; box-shadow:none;
      cursor:pointer; border-radius:6px; transition:background-color .15s ease, transform .1s ease;
    }
    .icon-btn img{ width:16px; height:16px; display:block; opacity:1; }
    .icon-btn:hover{ background:var(--p-surface-200); }
    .icon-btn:active{ transform:scale(0.96); }
    .icon-btn.danger:hover{ background:var(--p-red-50); }

    /* Cerrar GRANDE (48x48) en esquina superior derecha */
    .cd-close-fab{
      position: absolute;
      top: .35rem;
      right: .35rem;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    .cd-close-fab img{
      width: 24px;
      height: 24px;
    }

    /* ===== Body / Panel de datos ===== */
    .cd-body{ padding:.75rem 1rem; }
    .cd-panel.p-panel{ border:0; box-shadow:none; background:transparent; margin-bottom:.75rem; }
    .cd-panel .p-panel-header{ padding:0 0 .5rem; border-bottom:1px solid var(--p-surface-200); }
    .cd-panel .p-panel-title{ font-weight:700; color:var(--p-emphasis-high); font-size:.8rem; }
    .cd-panel .p-panel-content{
      background:var(--p-surface-0); border:1px solid var(--p-surface-200);
      border-radius:8px; padding:.75rem; margin-top:.4rem;
    }
    .cd-form{ display:grid; gap:.6rem; }
    .cd-field{ display:grid; gap:.3rem; }
    .cd-label{ font-weight:700; color:var(--p-text-muted-color); font-size:.7rem; text-transform:uppercase; letter-spacing:.3px; }
    .cd-input.p-inputtext{ width:100%; padding:.45rem .55rem; border-radius:6px; border:1px solid var(--p-surface-300); font-size:.8rem; }

    /* Tipo MESA / PARA LLEVAR */
    .cd-type-buttons{ display:flex; gap:.35rem; background:var(--p-surface-100); padding:.25rem; border-radius:8px; }
    .cd-type-btn{
      flex:1; padding:.45rem .35rem; border:0; background:transparent; border-radius:6px;
      font-size:.8rem; font-weight:800; cursor:pointer; transition:.2s ease; color:var(--p-text-color);
    }
    .cd-type-btn.active{ background:var(--p-primary-color); color:#fff; box-shadow:0 1px 2px rgba(0,0,0,.08); }
    .cd-type-btn:hover:not(.active){ background:var(--p-surface-200); }

    /* N° Mesa */
    .cd-table-field{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; align-items:end; }
    .cd-table-input .p-inputnumber{ width:100%; }
    .cd-table-input .p-inputnumber-input{ width:100%; text-align:center; padding:.4rem; font-size:.8rem; }

    /* ===== Tabla ===== */
    .cd-products{ margin-top:.75rem; }
    .cd-table.p-datatable .p-datatable-thead > tr > th{
      font-size:.72rem; font-weight:800; color:var(--p-emphasis-high);
      background:var(--p-surface-50); border:0; border-bottom:1px solid var(--p-surface-200);
      padding:.5rem .45rem; text-transform:uppercase; letter-spacing:.3px;
    }
    .cd-table.p-datatable .p-datatable-tbody > tr > td{
      border:0; border-bottom:1px solid var(--p-surface-100);
      padding:.5rem .45rem; line-height:1.1; vertical-align:middle; font-size:.82rem;
    }
    .cd-table.p-datatable .p-datatable-tbody > tr:hover > td{ background:var(--p-surface-50); }
    .cd-name{ font-weight:600; line-height:1.1; color:var(--p-emphasis-high); font-size:.82rem; }
    .cd-money{ font-variant-numeric:tabular-nums; font-weight:700; color:var(--p-emphasis-high); font-size:.82rem; }

    /* Acciones (productos) */
    .cd-actions{ display:flex; align-items:center; justify-content:flex-end; gap:.25rem; }

    .center{ text-align:center; }
    .right{ text-align:right; }

    .cd-qty{
      display:inline-block; min-width:24px; text-align:center; padding:.15rem .35rem; border-radius:6px;
      background:var(--p-primary-50); color:var(--p-primary-color); font-weight:800; font-size:.75rem;
    }

    /* ===== TOTAL A PAGAR ===== */
    .cd-total-section{
      margin-top: 1rem;
      border-top: 2px solid var(--p-surface-200);
      padding-top: 0.75rem;
    }
    .cd-total-main{
      display:flex; justify-content:space-between; align-items:center;
      background: var(--p-surface-50);
      border: 2px solid var(--p-primary-200);
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
    }
    .cd-total-main-label{
      font-size: 0.8rem; font-weight: 800; color: var(--p-primary-700);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .cd-total-main-amount{
      font-size: 0.95rem; font-weight: 900; color: var(--p-primary-700);
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 640px){
      .cd-total-main{ padding: 0.5rem 0.7rem; }
      .cd-total-main-label{ font-size: 0.75rem; }
      .cd-total-main-amount{ font-size: 0.9rem; }
    }

    /* ===== Footer ===== */
    .cart-drawer .p-drawer-footer{ padding:.75rem 1rem; border-top:1px solid var(--p-surface-200); background:var(--p-surface-0); }
    .cd-footer-buttons{ display:grid; grid-template-columns:1fr 1fr; gap:.5rem; width:100%; }
    .cd-footer-btn{ width:100%; padding:.6rem; font-weight:700; font-size:.85rem; border-radius:8px !important; }
    .cd-cancel-btn{ border:1px solid var(--p-surface-300) !important; }

    /* Móvil: Drawer full width */
    @media (max-width:640px){
      .p-drawer.cart-drawer.p-drawer-right{ width:100vw !important; max-width:100vw !important; right:0 !important; left:auto !important; border-radius:0 !important; }
      .p-drawer.cart-drawer .p-drawer-content{ display:flex; flex-direction:column; min-height:100vh; }
      .p-drawer.cart-drawer .p-drawer-body{ flex:1 1 auto; overflow:auto; }
      .p-drawer.cart-drawer .p-drawer-footer{ position:sticky; bottom:0; background:var(--p-surface-0); box-shadow:0 -1px 4px rgba(0,0,0,.1); }
      .cd-table-field{ grid-template-columns:1fr; gap:.3rem; }
    }
  `]
})
export class CartDrawerComponent {
  /* Visibilidad */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /* Productos */
  @Input() items: OrderItem[] = [];
  @Input() itemsCount = 0;
  @Output() edit = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  /* Acciones */
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  /* Campos del pedido */
  @Input() customer = '';
  @Output() customerChange = new EventEmitter<string>();

  @Input() type: 'MESA' | 'LLEVAR' = 'MESA';
  @Output() typeChange = new EventEmitter<'MESA' | 'LLEVAR'>();

  @Input() table: number | null = 1;
  @Output() tableChange = new EventEmitter<number | null>();

  /* Rutas de iconos */
  @Input() editIcon: string = '/icons/edit.png';
  @Input() deleteIcon: string = '/icons/delete.png';

  /* Opciones */
  typeOptions = [
    { label: 'MESA', value: 'MESA' as const },
    { label: 'PARA LLEVAR', value: 'LLEVAR' as const }
  ];

  /* Copias locales */
  customerLocal = this.customer;
  typeLocal: 'MESA' | 'LLEVAR' = this.type;
  tableLocal: number | null = this.table;

  get itemsLength(): number {
    return Array.isArray(this.items) ? this.items.length : 0;
  }

  ngOnChanges(): void {
    this.customerLocal = this.customer;
    this.typeLocal = this.type;
    this.tableLocal = this.table;
  }

  onTypeChange(next: 'MESA' | 'LLEVAR'){
    this.typeLocal = next;
    this.typeChange.emit(next);
    if (next === 'LLEVAR') {
      this.tableLocal = null;
      this.tableChange.emit(null);
    } else if (this.tableLocal == null || this.tableLocal < 1) {
      this.tableLocal = 1;
      this.tableChange.emit(1);
    }
  }

  total = computed(() =>
    (this.items ?? []).reduce((acc, it) => acc + it.qty * it.price, 0)
  );

  get totalAmount(): number {
    const list = Array.isArray(this.items) ? this.items : [];
    return list.reduce((acc, it) => acc + (it.qty ?? 0) * (it.price ?? 0), 0);
  }
}
