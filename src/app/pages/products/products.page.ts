// src/app/pages/products/products.page.ts
import { Component, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { ProductsStore } from './products.store';
import { ProductFormComponent } from '../../components/products/product-form.component';

@Component({
  standalone: true,
  selector: 'app-products-page',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    HttpClientModule,          // proveedor para HttpClient
    ProductFormComponent
  ],
  template: `
    <section class="products-page">
      <!-- HEAD -->
      <header class="head">
        <div class="head-inner">
          <h2 class="title">Productos</h2>
          <p class="subtitle">Registra nuevos productos para tu restaurante.</p>
          <div *ngIf="showSaved" class="toast ok">Producto guardado.</div>
        </div>
      </header>

      <!-- BODY (scroll solo aquí) -->
      <div class="body">
        <app-product-form
          [categories]="store.categories()"
          (save)="onSave($event)">
        </app-product-form>
      </div>
    </section>
  `,
  styles: [`
    :host{ display:block; height:100%; }

    /* Layout principal */
    .products-page{
      display:flex;
      flex-direction:column;
      height:100%;
      min-height:0;          /* permite que el hijo con overflow funcione */
      background: transparent;
    }

    /* HEAD */
    .head{
      flex:0 0 auto;
      border-bottom: 1px solid var(--p-surface-200);
      background: var(--p-surface-0);
    }
    .head-inner{
      padding: 1rem;
      display:flex;
      flex-direction:column;
      gap:.25rem;
    }
    .title{
      margin:0; font-weight:700;
      font-size: clamp(1.15rem, 2vw, 1.35rem);
      color: var(--p-surface-900);
    }
    .subtitle{
      margin:0; color: var(--p-surface-600);
      font-size: .95rem;
    }

    .toast{
      margin-top: .5rem;
      padding: .5rem .75rem;
      border-radius: .625rem;
      border: 1px solid var(--p-surface-200);
      background: var(--p-primary-50);
      color: var(--p-primary-700);
      display:inline-block;
    }
    .toast.ok{ border-color: var(--p-primary-200); }

    /* BODY con scroll interno */
    .body{
      flex:1 1 auto;
      min-height:0;          /* imprescindible para que overflow funcione dentro de un flex container */
      overflow: auto;        /* ⬅️ scroll sólo aquí */
      padding: 1rem;
      background: transparent;
    }

    @media (max-width: 768px){
      .head-inner{ padding: .85rem; }
      .body{ padding: .85rem; }
    }
  `]
})
export class ProductsPage {
  store = inject(ProductsStore);
  showSaved = false;

  onSave(product: any){
    this.store.add(product);
    this.showSaved = true;
    setTimeout(() => this.showSaved = false, 1800);
  }
}
