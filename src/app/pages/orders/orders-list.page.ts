import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersListComponent } from '../../components/orders/orders-list.component';

@Component({
  standalone: true,
  selector: 'app-orders-list-page',
  imports: [CommonModule, OrdersListComponent],
  template: `
    <div class="page">
      <app-orders-list></app-orders-list>
    </div>
  `,
  styles: [`
    :host{ display:block; }
    .page{ display:block; }
  `]
})
export class OrdersListPage {}
