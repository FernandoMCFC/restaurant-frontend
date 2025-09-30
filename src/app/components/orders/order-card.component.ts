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
    <article class="order-card">
      <header class="order-head">
        <div class="left">
          <span class="chip id">#{{ order.id }}</span>
          <span class="chip type" [class.mesa]="order.type==='MESA'" [class.llevar]="order.type==='LLEVAR'">
            {{ order.type === 'MESA' ? 'Mesa' : 'Llevar' }}
          </span>
        </div>

        <span class="chip status"
              [class.prep]="order.status==='EN_PREPARACION'"
              [class.done]="order.status==='ENTREGADO'"
              [class.cancel]="order.status==='CANCELADO'">
          {{ order.status === 'EN_PREPARACION' ? 'En preparación' : (order.status === 'ENTREGADO' ? 'Entregado' : 'Cancelado') }}
        </span>
      </header>

      <ul class="items">
        <li *ngFor="let it of order.items">
          <span class="name">{{it.qty}} × {{it.name}}</span>
          <span class="sub">{{ (it.qty * it.price) | number:'1.0-0' }} Bs</span>
        </li>
      </ul>

      <div class="total">
        <span>Total</span>
        <b>{{ order.total | number:'1.0-0' }} Bs</b>
      </div>

      <footer class="actions">
        <button pButton pRipple label="Entregar" class="p-button-success"
                (click)="deliver.emit(order.id)" [disabled]="order.status!=='EN_PREPARACION'"></button>
        <button pButton pRipple label="Cancelar" class="p-button-text p-button-danger"
                (click)="cancel.emit(order.id)" [disabled]="order.status!=='EN_PREPARACION'"></button>
      </footer>
    </article>
  `,
  styles: [`
    .order-card{
      border:1px solid var(--p-surface-200);
      border-radius:16px;
      padding:14px;
      background:var(--p-surface-0);
      box-shadow: var(--p-shadow-1);
    }

    .order-head{
      display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;
    }
    .left{ display:flex; gap:8px; align-items:center; }

    .chip{
      display:inline-flex; align-items:center; gap:6px;
      padding:6px 10px; border-radius:999px; font-size:12px; font-weight:600;
      border:1px solid transparent;
    }
    .chip.id{ background:var(--p-primary-100); color:var(--p-primary-700); }
    .chip.type.mesa{ background:var(--p-blue-100); color:var(--p-blue-700); }
    .chip.type.llevar{ background:var(--p-orange-100); color:var(--p-orange-700); }
    .chip.status.prep{ background:var(--p-yellow-100); color:var(--p-yellow-700); }
    .chip.status.done{ background:var(--p-green-100); color:var(--p-green-700); }
    .chip.status.cancel{ background:var(--p-red-100); color:var(--p-red-700); }

    .items{ list-style:none; margin:10px 0 8px; padding:0; display:flex; flex-direction:column; gap:6px; }
    .items li{ display:flex; justify-content:space-between; align-items:center; }
    .name{ color:var(--p-emphasis-high); }
    .sub{ color:var(--p-emphasis-medium); font-weight:600; }

    .total{ display:flex; justify-content:space-between; align-items:center; margin:8px 0 12px; font-size:15px; }
    .total span{ color:var(--p-emphasis-medium); }

    .actions{ display:flex; gap:8px; }
  `]
})
export class OrderCardComponent {
  @Input() order!: Order;
  @Output() deliver = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();
}
