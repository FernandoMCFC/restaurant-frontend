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
    /* Hacemos que esta página llene la altura disponible del layout */
    :host{
      display:block;
      height:100%;
      min-height:0; /* clave para permitir overflow interno en el hijo */
    }
    .page{
      display:block;
      height:100%;
      min-height:0;
      overflow:hidden; /* delega el scroll al hijo */
    }
    /* MUY IMPORTANTE: el componente hijo debe estirar a 100% */
    .page app-orders-list{
      display:block;
      height:100%;
      min-height:0;
      overflow:hidden; /* el scroll real estará en .grid-list */
    }
  `]
})
export class OrdersListPage {}
