import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { OrdersStore } from '../../pages/orders/orders.store';
import { OrderCardComponent } from './order-card.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, OrderCardComponent],
  template: `
    <section class="orders">
      <header class="header">
        <h1>Pedidos</h1>
      </header>

      <div class="grid-list">
        <app-order-card
          *ngFor="let o of orders()"
          [order]="o"
          (deliver)="onDeliver($event)"
          (cancel)="onCancel($event)">
        </app-order-card>
      </div>

      <!-- FAB -->
      <button class="fab" pButton pRipple icon="pi pi-plus" (click)="goNew()" title="Nuevo pedido"></button>
    </section>
  `,
  styles: [`
    :host{ display:block; }
    /* Padding local para que esta página no se vea "pegada"
       (no afecta a las demás pantallas) */
    .orders{ position:relative; padding:16px; }
    @media (min-width: 992px){ .orders{ padding:20px; } }

    .header{ margin-bottom:12px; }
    .header h1{ margin:0; font-size:22px; font-weight:700; color:var(--p-emphasis-high); }

    .grid-list{
      display:grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    @media (min-width: 768px){
      .grid-list{ grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1200px){
      .grid-list{ grid-template-columns: repeat(3, 1fr); }
    }

    .fab{
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 56px; height: 56px; border-radius: 999px;
      background: var(--p-primary-500); border:none;
      color:white; box-shadow: var(--p-shadow-3);
      display:grid; place-items:center;
    }
  `]
})
export class OrdersListComponent {
  private store = inject(OrdersStore);
  private router = inject(Router);

  orders = computed(() => this.store.orders());

  onDeliver(id: string){ this.store.setDelivered(id); }
  onCancel(id: string){ this.store.cancel(id); }
  goNew(){ this.router.navigateByUrl('/orders/new'); }
}
