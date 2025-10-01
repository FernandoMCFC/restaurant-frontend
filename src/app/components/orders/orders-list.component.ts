import { Component, computed } from '@angular/core';
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

        <button
          pButton
          icon="pi pi-plus"
          class="add-btn p-button-rounded p-button-icon-only"
          aria-label="Nuevo pedido"
          (click)="goNew()">
        </button>
      </header>

      <div class="grid-list">
        <app-order-card
          *ngFor="let o of orders()"
          [order]="o"
          [isNew]="store.isNew(o.id)"
          (seen)="store.markSeen($event)"
          (deliver)="onDeliver($event)"
          (cancel)="onCancel($event)">
        </app-order-card>
      </div>
    </section>
  `,
  styles: [`
    .orders{ padding:16px; }

    .header{
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:12px;
    }
    .header h1{
      margin:0; font-size:22px; font-weight:700; color:var(--p-emphasis-high);
    }

    /* Botón circular “+” perfectamente centrado */
    .add-btn.p-button{
      width:46px; height:46px; border-radius:9999px;
      padding:0;                            /* sin padding extra */
      display:inline-flex;
      align-items:center; justify-content:center; /* centra el ícono */
    }
    .add-btn .p-button-icon,
    .add-btn .p-button-icon-left{ margin:0 !important; } /* quita el desplazamiento del ícono */
    .add-btn .p-button-label{ display:none; }            /* ocultar etiqueta por si PrimeNG la renderiza */

    .grid-list{
      display:grid; gap:16px;
      grid-template-columns: repeat(1, minmax(0,1fr));
    }
    @media (min-width: 640px){
      .grid-list{ grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1200px){
      .grid-list{ grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class OrdersListComponent {
  constructor(public store: OrdersStore, private router: Router) {}
  orders = computed(() => this.store.orders());

  onDeliver(id: string){ this.store.setDelivered(id); }
  onCancel(id: string){ this.store.cancel(id); }
  goNew(){ this.router.navigateByUrl('/orders/new'); }
}
