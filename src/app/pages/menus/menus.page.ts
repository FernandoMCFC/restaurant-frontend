// src/app/pages/menus/menus.page.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';

import { MenusStore } from './menus.store';
import type { Menu } from './menus.types';

import { ProductsStore } from '../products/products.store';
import type { Product, ProductCategory } from '../products/products.types';
import { CategoriesStore } from '../categories/categories.store';

import { MenusHeaderComponent } from '../../components/menus/menus-header.component';
import { MenusListComponent } from '../../components/menus/menus-list.component';
import { MenuFormComponent } from '../../components/menus/menu-form.component';

@Component({
  selector: 'app-menus-page',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    DialogModule,
    MenusHeaderComponent,
    MenusListComponent,
    MenuFormComponent,
  ],
  template: `
    <div class="page">
      <!-- Encabezado -->
      <app-menus-header
        [title]="'Menús'"
        [subtitle]="'Crea y administra los menús de tu restaurante.'"
        (addClick)="openAdd()"
      ></app-menus-header>

      <!-- Lista -->
      <div class="page-body">
        <app-menus-list
          [menus]="menus()"
          [categories]="categories()"
          [products]="products()"
          (edit)="openEdit($event)"
          (remove)="onRemove($event)"
        ></app-menus-list>
      </div>

      <!-- Modal crear / editar menú -->
      <p-dialog
        [(visible)]="dialogVisible"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [closable]="true"
        [dismissableMask]="true"
        [blockScroll]="true"
        [style]="{
          width: '760px',
          maxWidth: '98vw',
          height: '640px',
          maxHeight: '90vh'
        }"
        [contentStyle]="{
          'height': '540px',
          'max-height': '540px',
          'overflow': 'auto'
        }"
        (onHide)="closeDialog()"
      >
        <ng-template pTemplate="header">
          <span>{{ dialogTitle() }}</span>
        </ng-template>

        <app-menu-form
          [model]="editing() || undefined"
          [categories]="categories()"
          [products]="products()"
          (save)="onSave($event)"
          (cancel)="closeDialog()"
        ></app-menu-form>
      </p-dialog>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
      }

      .page {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        background: var(--surface-ground);
      }

      .page-body {
        flex: 1 1 auto;
        min-height: 0;
        padding: 0 1.5rem 1.5rem;
        overflow: auto;
      }

      @media (max-width: 768px) {
        .page-body {
          padding: 0 1rem 1rem;
        }
      }
    `,
  ],
})
export class MenusPage {
  private readonly menusStore = inject(MenusStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly categoriesStore = inject(CategoriesStore);

  /** Signal con los menús */
  readonly menus = this.menusStore.menus;

  /** Categorías disponibles (mapeadas a ProductCategory: id + name) */
  readonly categories = computed<ProductCategory[]>(() =>
    this.categoriesStore.itemsActive().map((c: any) => ({
      id: c.id,
      name: c.name,
    }))
  );

  /** Productos disponibles desde ProductsStore */
  readonly products = computed<Product[]>(() => this.productsStore.products());

  /** UI state */
  dialogVisible = false;
  readonly editing = signal<Menu | null>(null);

  readonly dialogTitle = computed(() =>
    this.editing() ? 'Editar menú' : 'Nuevo menú'
  );

  openAdd() {
    this.editing.set(null);
    this.dialogVisible = true;
  }

  openEdit(menu: Menu) {
    this.editing.set(menu);
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.editing.set(null);
  }

  onSave(data: Omit<Menu, 'id'>) {
    const current = this.editing();
    if (current) {
      this.menusStore.update(current.id, data);
    } else {
      this.menusStore.add(data);
    }
    this.closeDialog();
  }

  onRemove(id: string) {
    this.menusStore.remove(id);
  }
}
