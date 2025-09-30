import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFormComponent } from '../../components/orders/order-form.component';

@Component({
  standalone: true,
  selector: 'app-order-form-page',
  imports: [CommonModule, OrderFormComponent],
  template: `
    <div class="page">
      <app-order-form></app-order-form>
    </div>
  `,
  styles: [`
    :host{ display:block; }
    .page{ display:block; }
  `]
})
export class OrderFormPage {}
