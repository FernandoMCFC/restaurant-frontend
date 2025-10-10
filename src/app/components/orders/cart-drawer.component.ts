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
            [style]="{ width: '100%' }"
          >
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

          <p-divider styleClass="my-2"></p-divider>

          <div class="totals">
            <span>Total</span>
            <b>{{ total() | number:'1.2-2' }} Bs</b>
          </div>
        </div>

        <ng-template #empty>
          <div class="empty">No hay productos en el pedido.</div>
        </ng-template>
      </div>

      <ng-template pTemplate="footer">
        <div class="cart-actions">
          <button pButton label="Cancelar" class="p-button-text" (click)="cancel.emit()"></button>
          <span class="spacer"></span>
          <button pButton label="Guardar" (click)="save.emit()"></button>
        </div>
      </ng-template>
    </p-drawer>
  `,
  styles: [`
    :host{ display:block; }
    .cart-head{ display:flex; align-items:center; justify-content:space-between; }
    .muted{ color: var(--p-text-muted-color); font-size:.85rem; }

    .cart-body{ display:block; }
    .item-name{ font-weight:700; }
    .center{ text-align:center; }
    .right{ text-align:right; }
    .actions-cell .p-button{ margin-left:4px; }

    .qty-chip{
      display:inline-block; min-width:36px; text-align:center;
      padding:.25rem .5rem; border-radius:999px;
      background:var(--p-surface-200);
      font-weight:700;
    }

    .totals{
      display:flex; align-items:center; justify-content:space-between;
      font-size:1rem; font-weight:700; padding:.25rem 0;
    }

    .empty{
      text-align:center; padding:2rem 0; color:var(--p-text-muted-color);
    }

    .cart-actions{ display:flex; align-items:center; }
    .cart-actions .spacer{ flex:1 1 auto; }
  `]
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
