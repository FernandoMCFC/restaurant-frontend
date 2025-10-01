import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Order } from '../../pages/orders/orders.types';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  template: `
    <article class="order-card" [class.is-new]="isNew" (click)="seen.emit(order.id)">
      <header class="order-head">
        <div class="left">
          <span class="chip id">#{{ order.id }}</span>
          <span
            class="chip type"
            [class.mesa]="order.type === 'MESA'"
            [class.llevar]="order.type === 'LLEVAR'">
            {{ order.type === 'MESA' ? 'Mesa' : 'Llevar' }}
          </span>
          <span
            class="chip status"
            [class.prep]="order.status === 'EN_PREPARACION'"
            [class.done]="order.status === 'ENTREGADO'"
            [class.cancel]="order.status === 'CANCELADO'">
            {{
              order.status === 'EN_PREPARACION'
                ? 'En preparación'
                : order.status === 'ENTREGADO'
                ? 'Entregado'
                : 'Cancelado'
            }}
          </span>
        </div>
      </header>

      <ul class="items">
        <li *ngFor="let it of order.items">
          <span class="name">{{ it.qty }} × {{ it.name }}</span>
          <span class="sub">{{ it.price | number: '1.0-0' }} Bs</span>
        </li>
      </ul>

      <div class="total">
        <span>Total</span>
        <strong>{{ order.total | number: '1.0-0' }} Bs</strong>
      </div>

      <div class="actions">
        <button
          pButton
          pRipple
          label="Entregar"
          class="p-button-sm p-button-success"
          (click)="deliver.emit(order.id)"></button>
        <button
          pButton
          pRipple
          label="Cancelar"
          class="p-button-sm p-button-danger p-button-outlined"
          (click)="cancel.emit(order.id)"></button>
      </div>
    </article>
  `,
  styles: [
    `
      .order-card {
        position: relative;
        border: 1px solid var(--p-surface-200);
        background: var(--p-surface-0);
        border-radius: 12px;
        padding: 14px 14px 12px;
        display: block;
      }

      .order-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .left {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid transparent;
      }
      .chip.id {
        background: var(--p-primary-100);
        color: var(--p-primary-700);
      }
      .chip.type.mesa {
        background: var(--p-blue-100);
        color: var(--p-blue-700);
      }
      .chip.type.llevar {
        background: var(--p-orange-100);
        color: var(--p-orange-700);
      }
      .chip.status.prep {
        background: var(--p-yellow-100);
        color: var(--p-yellow-700);
      }
      .chip.status.done {
        background: var(--p-green-100);
        color: var(--p-green-700);
      }
      .chip.status.cancel {
        background: var(--p-red-100);
        color: var(--p-red-700);
      }

      .items {
        list-style: none;
        margin: 10px 0 8px;
        padding: 0;
        display: grid;
        gap: 6px;
      }
      .items li {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .name {
        color: var(--p-emphasis-high);
      }
      .sub {
        color: var(--p-emphasis-medium);
        font-weight: 600;
      }

      .total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0 12px;
        font-size: 15px;
      }
      .total span {
        color: var(--p-emphasis-medium);
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      /* === Resaltado/animación para pedidos nuevos === */
      @keyframes cardPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.35);
          transform: translateY(2px);
        }
        60% {
          box-shadow: 0 8px 30px -8px rgba(250, 204, 21, 0.55);
          transform: translateY(0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
        }
      }
      .order-card.is-new {
        background: #fef9c3; /* amber-100 */
        border-color: #fde68a; /* amber-200 */
        animation: cardPulse 1.2s ease-in-out 2;
      }
    `,
  ],
})
export class OrderCardComponent {
  @Input() order!: Order;

  @Output() deliver = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  /** Estado visual “nuevo” */
  @Input() isNew: boolean = false;
  /** Notifica que se vio (para quitar resaltado) */
  @Output() seen = new EventEmitter<string>();
}
