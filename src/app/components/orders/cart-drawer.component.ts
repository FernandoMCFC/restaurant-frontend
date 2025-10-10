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
      [showCloseIcon]="true"
      [blockScroll]="true"
      [dismissible]="true"
      [style]="{ width: 'min(400px, 92vw)' }"
      styleClass="cart-drawer cd-compact"
      (visibleChange)="visibleChange.emit($event)"
    >
      <ng-template pTemplate="header">
        <div class="cd-header">
          <div class="cd-title">Resumen de pedido</div>
          <span class="cd-items">Items: {{ itemsCount }}</span>
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
              />
            </div>

            <div class="cd-field">
              <label class="cd-label">Tipo</label>
              <p-selectButton
                [options]="typeOptions"
                [(ngModel)]="typeLocal"
                (ngModelChange)="onTypeChange($event)"
                optionLabel="label"
                optionValue="value"
                styleClass="cd-type"
              ></p-selectButton>
            </div>

            <div class="cd-field" *ngIf="typeLocal === 'MESA'">
              <label class="cd-label">N° de mesa</label>
              <p-inputNumber
                [(ngModel)]="tableLocal"
                (ngModelChange)="tableChange.emit(tableLocal)"
                [min]="1"
                [useGrouping]="false"
                [showButtons]="true"
              ></p-inputNumber>
            </div>
          </div>
        </p-panel>

        <!-- Productos -->
        <div class="cd-products">
          <p-table [value]="items" dataKey="id" *ngIf="(items?.length ?? 0) > 0" styleClass="cd-table">
            <ng-template pTemplate="header">
              <tr>
                <th>Producto</th>
                <th class="center" style="width:86px">Cant.</th>
                <th class="right" style="width:108px">Importe</th>
                <th style="width:72px"></th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row let-i="rowIndex">
              <tr>
                <td><div class="cd-name">{{ row.name }}</div></td>
                <td class="center"><span class="cd-qty">{{ row.qty }}</span></td>
                <td class="right cd-money">{{ row.qty * row.price | number:'1.2-2' }} Bs</td>

                <!-- Acciones solo-ícono (PNG/SVG), lado a lado -->
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

            <ng-template pTemplate="footer">
              <tr>
                <td colspan="2" class="right cd-total-label">Total</td>
                <td class="right cd-total">{{ total() | number:'1.2-2' }} Bs</td>
                <td></td>
              </tr>
            </ng-template>
          </p-table>

          <div class="cd-empty" *ngIf="(items?.length ?? 0) === 0">
            No hay productos en el pedido.
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="cd-footer">
          <button pButton label="Cancelar" class="p-button-text p-button-sm" (click)="cancel.emit()"></button>
          <span class="flex-spacer"></span>
          <button pButton label="Guardar" icon="pi pi-check" class="p-button-sm" (click)="save.emit()"></button>
        </div>
      </ng-template>
    </p-drawer>
  `,
  styles: [`
    :host{ display:block; }

    /* ===== Escala compacta ===== */
    .cd-compact{ font-size: .85rem; }
    .cd-compact .cd-label,
    .cd-compact .p-panel-title{ font-size: .75rem; }
    .cd-compact .p-inputtext,
    .cd-compact .p-inputnumber input{ font-size: .85rem; }
    .cd-compact .p-button.p-button-sm{ padding: .25rem .5rem; font-size: .8rem; }

    /* Header */
    .cart-drawer .p-drawer-header{ padding: .6rem .75rem; }
    .cd-header{ display:flex; align-items:center; gap:.4rem; }
    .cd-title{ font-weight:800; font-size:.95rem; }
    .cd-items{ color:var(--p-text-muted-color); font-size:.75rem; }

    /* Panel de datos */
    .cd-body{ padding: .25rem .5rem .5rem; }
    .cd-panel.p-panel{ border:0; box-shadow:none; background:transparent; margin-bottom:.35rem; }
    .cd-panel .p-panel-header{ padding:.35rem 0 .2rem; }
    .cd-panel .p-panel-title{ font-weight:700; color:var(--p-emphasis-high); }
    .cd-panel .p-panel-content{
      background: var(--p-surface-50);
      border: 1px solid var(--p-surface-200);
      border-radius: .6rem;
      padding: .55rem;
    }
    .cd-form{ display:grid; gap:.45rem; }
    .cd-field{ display:grid; gap:.2rem; }
    .cd-label{ font-weight:600; color:var(--p-text-muted-color); }
    .cd-type .p-button{ padding:.25rem .6rem; font-size:.8rem; }

    /* Tabla de productos – densa */
    .cd-products{ margin-top:.2rem; }
    .cd-table.p-datatable .p-datatable-thead > tr > th{
      font-size:.78rem; font-weight:800; color:var(--p-emphasis-high);
      background:transparent; border:0; border-bottom:1px solid var(--p-surface-200);
      padding:.35rem .4rem;
    }
    .cd-table.p-datatable .p-datatable-tbody > tr > td{
      border:0; border-bottom:1px dashed var(--p-surface-200);
      padding:.38rem .4rem; line-height:1.1;
      vertical-align:middle; font-size:.88rem;
    }
    .cd-name{ font-weight:700; line-height:1.15; }
    .cd-money{ font-variant-numeric: tabular-nums; }

    /* ===== Acciones: solo icono, sin borde ni fondo ===== */
    .cd-actions{ display:flex; align-items:center; justify-content:flex-end; gap:.25rem; }
    .icon-btn{
      display:inline-flex; align-items:center; justify-content:center;
      width:28px; height:28px; padding:0;
      border:0; background:transparent; box-shadow:none;
      cursor:pointer;
    }
    .icon-btn img{ width:18px; height:18px; display:block; }
    .icon-btn:hover,
    .icon-btn:focus{ background:transparent; border:0; box-shadow:none; outline:none; }
    .icon-btn.ghost{ /* mantiene área clickeable sin estilos visuales */ }
    .icon-btn.danger{ /* mismo look, solo icono */ }

    .center{ text-align:center; }
    .right{ text-align:right; }

    .cd-qty{
      display:inline-block; min-width:24px; text-align:center;
      padding:.1rem .4rem; border-radius:999px;
      background:var(--p-surface-200);
      font-weight:800; font-size:.78rem;
    }

    .cd-total-label{ font-weight:800; }
    .cd-total{ font-weight:900; font-size:.98rem; }

    .cd-empty{
      text-align:center; padding:1rem 0;
      color:var(--p-text-muted-color); font-size:.85rem;
    }

    /* Footer */
    .cart-drawer .p-drawer-footer{ padding:.4rem .5rem; }
    .cd-footer{ display:flex; align-items:center; }
    .flex-spacer{ flex:1 1 auto; }

    /* Full width móviles */
    @media (max-width: 640px){
      .p-drawer.cart-drawer.p-drawer-right{
        width: 100vw !important;
        max-width: 100vw !important;
        right: 0 !important;
        left: auto !important;
        border-radius: 0 !important;
      }
      .p-drawer.cart-drawer .p-drawer-content{ display:flex; flex-direction:column; min-height:100vh; }
      .p-drawer.cart-drawer .p-drawer-body{ flex:1 1 auto; overflow:auto; }
      .p-drawer.cart-drawer .p-drawer-footer{ position:sticky; bottom:0; background:var(--p-surface-0); }
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
}
