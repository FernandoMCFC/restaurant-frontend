import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 (módulos seguros) */
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

import { ProductsStore } from './products.store';
import { ProductFormComponent } from '../../components/products/product-form.component';

@Component({
  standalone: true,
  selector: 'app-products-page',
  imports: [CommonModule, CardModule, DividerModule, ProductFormComponent],
  template: `
    <section class="grid" style="gap:1rem">
      <p-card styleClass="w-full">
        <ng-template pTemplate="header">
          <div class="flex align-items-center justify-content-between">
            <h2 class="m-0">Productos</h2>
          </div>
        </ng-template>

        <p class="m-0 text-600">Registra nuevos productos para tu restaurante.</p>

        <p-divider></p-divider>

        <app-product-form
          [categories]="store.categories()"
          (save)="onSave($event)">
        </app-product-form>
      </p-card>

      <div *ngIf="showSaved"
           class="w-full p-2 border-round"
           style="background: var(--green-100); color: var(--green-800); border:1px solid var(--green-300);">
        Producto guardado.
      </div>
    </section>
  `
})
export class ProductsPage {
  store = inject(ProductsStore);
  showSaved = false;

  onSave(product: any){
    this.store.add(product);
    this.showSaved = true;
    setTimeout(() => this.showSaved = false, 2000);
  }
}
