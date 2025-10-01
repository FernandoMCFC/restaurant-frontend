import { Component, EventEmitter, Input, Output, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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

        <!-- Tiempo transcurrido SOLO cuando está en preparación -->
        <span *ngIf="showElapsed" class="elapsed" [title]="startedAt ? (startedAt | date:'short') : ''">
          ⏱ {{ elapsedMinutesLabel }}
        </span>
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
        gap: 12px;
        flex-wrap: wrap;
      }
      .left {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      /* Badge de minutos (solo visible en preparación) */
      .elapsed{
        display:inline-block;
        padding:4px 8px;
        border-radius:999px;
        background: var(--p-surface-100);
        color: var(--p-text-color);
        font-size:.85rem;
        font-weight:600;
        line-height:1;
        white-space:nowrap;
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
export class OrderCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() order!: Order;

  @Output() deliver = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  /** Estado visual “nuevo” */
  @Input() isNew: boolean = false;
  /** Notifica que se vio (para quitar resaltado) */
  @Output() seen = new EventEmitter<string>();

  /** ===== Tiempo transcurrido (solo en preparación) ===== */
  startedAt: Date | null = null;
  elapsedMinutesLabel = '—';
  showElapsed = false;

  private timer: any;

  ngOnInit(): void {
    // createdAt si existe
    const createdAt = (this.order as any)?.createdAt as string | undefined;
    this.startedAt = createdAt ? new Date(createdAt) : null;

    this.updateTickerState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']) {
      // Si cambió el estado o el createdAt, reevalúa
      const createdAt = (this.order as any)?.createdAt as string | undefined;
      this.startedAt = createdAt ? new Date(createdAt) : null;
      this.updateTickerState();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  /** Arranca/para el temporizador según el estado actual */
  private updateTickerState(): void {
    this.showElapsed = this.order?.status === 'EN_PREPARACION';

    if (this.showElapsed) {
      // actualizar ahora y cada 60s
      this.updateElapsed();
      this.clearTimer();
      this.timer = setInterval(() => this.updateElapsed(), 60_000);
    } else {
      // si no está en preparación, ocultar y detener
      this.clearTimer();
      this.elapsedMinutesLabel = '—';
    }
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private updateElapsed(): void {
    if (!this.startedAt || isNaN(this.startedAt.getTime())) {
      this.elapsedMinutesLabel = '—';
      return;
    }
    const diffMs = Date.now() - this.startedAt.getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    this.elapsedMinutesLabel = `${mins} min`;
  }
}
