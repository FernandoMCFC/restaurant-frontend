// src/app/pages/products/products.page.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';

import { ProductsStore } from './products.store';
import type { Product, ProductCategory } from './products.types';
import { CategoriesStore } from '../categories/categories.store';

import { ProductFormComponent } from '../../components/products/product-form.component';
import { ProductsHeaderComponent } from '../../components/products/products-header.component';
import { ProductsListComponent } from '../../components/products/products-list.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    DialogModule,
    ProductsHeaderComponent,
    ProductsListComponent,
    ProductFormComponent,
  ],
  template: `
    <section class="products-page">
      <app-products-header
        [title]="'Productos'"
        [subtitle]="'Administra tus productos.'"
        [active]="active()"
        (activeChange)="onActiveChange($event)"
        (addClick)="openAdd()"
      ></app-products-header>

      <div class="body">
        <app-products-list
          [showUnavailable]="showUnavailable()"
          (edit)="openEdit($event)"
          (remove)="onRemove($event)">
        </app-products-list>
      </div>

      <!-- Modal Agregar / Editar producto -->
      <p-dialog
        [visible]="showAdd()"
        (visibleChange)="showAdd.set($event)"
        [modal]="true"
        [dismissableMask]="true"
        [draggable]="false"
        [resizable]="false"
        [header]="dialogTitle()"
        [style]="{ width: '720px', maxWidth: '96vw' }"
      >
        <app-product-form
          [categories]="productCategories()"
          [model]="editing() ?? undefined"
          (save)="onSave($event)"
        ></app-product-form>
      </p-dialog>
    </section>
  `,
  styles: [`
    :host{ display:block; }

    .products-page{
      padding:.5rem;
      display:flex;
      flex-direction:column;
      gap:.75rem;
      height:100%;
      box-sizing:border-box;
    }

    .body{
      background: transparent;
      border-radius:.75rem;
      min-height: 240px;
    }

    @media (min-width: 1024px){
      .products-page{
        padding:.65rem;
        gap:.65rem;
      }
    }

    /* ➤ Más espacio para el título "Agregar producto" dentro del modal */
    :host ::ng-deep .p-dialog .p-dialog-header{
      padding: 1rem 1.5rem;
    }

    :host ::ng-deep .p-dialog .p-dialog-header .p-dialog-title{
      margin-left: .1rem;
    }

    :host ::ng-deep .p-dialog .p-dialog-content{
      padding-top: .35rem;
      padding-inline: 0; /* el padding lo maneja el formulario */
    }
  `]
})
export class ProductsPage {
  private store = inject(ProductsStore);
  private categoriesStore = inject(CategoriesStore);

  // Categorías reales desde CategoriesStore (solo activas)
  productCategories = computed<ProductCategory[]>(() =>
    this.categoriesStore.itemsActive().map(c => ({
      id: c.id,
      name: c.name,
    }))
  );

  // Switch "Activos"
  active = signal(true);
  // Cuando el switch está apagado, mostramos los NO disponibles
  showUnavailable = computed(() => !this.active());

  // Estado del modal y producto en edición
  showAdd = signal(false);
  editing = signal<Product | null>(null);

  dialogTitle = computed(() =>
    this.editing() ? 'Editar producto' : 'Agregar producto'
  );

  onActiveChange(v: boolean) {
    this.active.set(v);
  }

  openAdd() {
    this.editing.set(null);
    this.showAdd.set(true);
  }

  openEdit(item: Product) {
    this.editing.set(item);
    this.showAdd.set(true);
  }

  closeAdd() {
    this.showAdd.set(false);
    this.editing.set(null);
  }

  onSave(data: Omit<Product, 'id'>) {
    const current = this.editing();
    if (current) {
      this.store.update(current.id, data);
    } else {
      this.store.add(data);
    }
    this.closeAdd();
  }

  onRemove(id: string) {
    this.store.remove(id);
  }
}
