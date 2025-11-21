// src/app/pages/products/products.page.ts
import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

/* PrimeNG v20 */
import { DividerModule } from 'primeng/divider';

import { ProductsStore } from './products.store';
import type { Product } from './products.types';

import { ProductFormComponent } from '../../components/products/product-form.component';
import { ProductsHeaderComponent } from '../../components/products/products-header.component';
import { ProductsListComponent } from '../../components/products/products-list.component';

type Mode = 'list' | 'add' | 'edit';

@Component({
  standalone: true,
  selector: 'app-products-page',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    HttpClientModule,
    DividerModule,
    ProductsHeaderComponent,
    ProductsListComponent,
    ProductFormComponent
  ],
  template: `
    <section class="page">
      <!-- HEADER -->
      <app-products-header
        [title]="'Productos'"
        [subtitle]="mode() === 'list' ? 'Administra tus productos' : (mode() === 'add' ? 'Nuevo producto' : 'Editar producto')"
        [mode]="mode()"
        (addClick)="openAdd()"
        (backClick)="backToList()"
      ></app-products-header>

      <!-- BODY -->
      <div class="body" *ngIf="mode() === 'list'">
        <app-products-list
          (edit)="openEdit($event)"
          (remove)="onRemove($event)"
        ></app-products-list>
      </div>

      <div class="body" *ngIf="mode() !== 'list'">
        <app-product-form
          [categories]="store.categories()"
          [model]="editing() ?? undefined"
          (save)="onSave($event)">
        </app-product-form>
      </div>
    </section>
  `,
  styles: [`
    :host{ display:block; }
    .page{
      display:flex; flex-direction:column;
      gap:.5rem; height:100%;
      padding: .35rem;
    }
    .body{
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-200);
      border-radius: .75rem;
      padding: .85rem;
      min-height: 240px;
    }

    @media (min-width: 1024px){
      .page{ padding:.65rem; gap:.65rem; }
      .body{ padding: .85rem; }
    }
  `]
})
export class ProductsPage {
  store = inject(ProductsStore);

  // UI state
  mode = signal<Mode>('list');
  editing = signal<Product | null>(null);

  openAdd(){ this.editing.set(null); this.mode.set('add'); }
  openEdit(item: Product){ this.editing.set(item); this.mode.set('edit'); }
  backToList(){ this.mode.set('list'); this.editing.set(null); }

  onSave(data: Omit<Product,'id'>){
    const current = this.editing();
    if (current) {
      this.store.update(current.id, data);
    } else {
      this.store.add(data);
    }
    this.backToList();
  }

  onRemove(id: string){
    this.store.remove(id);
  }
}
