import { Component, EventEmitter, Input, Output, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 */
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';

export type OrderItem = { id: string; name: string; qty: number; price: number };

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, DrawerModule, TableModule, ButtonModule, DividerModule, ToolbarModule],
  template: `
    <!-- Drawer carrito (idéntico al que tenías) -->
    <p-drawer
      [(visible)]="visible"
      position="right"
      [modal]="true"
      [showCloseIcon]="true"
      [blockScroll]="true"
      [dismissible]="true"
      [style]="{ width: 'min(420px, 90vw)' }"
      (visibleChange)="visibleChange.emit($event)"
    >
      <ng-template pTemplate="header">
        <div class="cart-head">
          <h3>Resumen de pedido</h3>
          <span class="muted">Items: {{ itemsCount }}</span>
        </div>
      </ng-template>

      <div class="cart-body">
        <div *ngIf="items?.length; else empty">
          <p-table
            [value]="items"
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
                </td>

                <td class="center">
                  <span class="qty-chip">{{ row.qty }}</span>
                </td>

                <td class="right">{{ row.qty * row.price | number:'1.2-2' }} Bs</td>

                <td class="right actions-cell">
                  <button pButton icon="pi pi-pencil"
                          class="p-button-text"
                          (click)="edit.emit(i)"
                          aria-label="Editar"></button>

                  <button pButton icon="pi pi-times"
                          class="p-button-text"
                          (click)="remove.emit(i)"
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
            <button pButton label="Cancelar" severity="secondary" (click)="cancel.emit()"></button>
            <button pButton label="Guardar" icon="pi pi-check" (click)="save.emit()"></button>
          </div>
        </div>
      </div>
    </p-drawer>
  `
})
export class CartDrawerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() items: OrderItem[] = [];
  @Input() itemsCount = 0;

  @Output() edit = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  total = computed(() =>
    (this.items ?? []).reduce((acc, it) => acc + it.qty * it.price, 0)
  );
}
