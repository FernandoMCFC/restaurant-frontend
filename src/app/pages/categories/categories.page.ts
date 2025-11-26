// src/app/pages/categories/categories.page.ts
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesHeaderComponent } from '../../components/categories/categories-header.component';
import { CategoriesListComponent } from '../../components/categories/categories-list.component';
import { CategoryAddDialogComponent } from '../../components/categories/category-add-dialog.component';
import { CategoriesOrderDialogComponent } from '../../components/categories/categories-order-dialog.component';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    CategoriesHeaderComponent,
    CategoriesListComponent,
    CategoryAddDialogComponent,
    CategoriesOrderDialogComponent
  ],
  template: `
    <section class="categories-page">
      <!-- HEAD -->
      <app-categories-header
        [title]="'Categorías'"
        [subtitle]="'Listado de categorías registradas.'"
        [active]="active()"
        (activeChange)="onActiveChange($event)"
        (addClick)="openAdd()"
        (orderClick)="showOrder.set(true)"
      />

      <!-- BODY -->
      <app-categories-list
        [showDeleted]="showDeleted()"
        (edit)="openEdit($event)"
      ></app-categories-list>

      <!-- Modal Agregar / Editar (manejado por el componente) -->
      <app-category-add-dialog
        [visible]="showAdd()"
        (visibleChange)="showAdd.set($event)"
        [editId]="editId()"
      ></app-category-add-dialog>

      <!-- Modal Ordenar (ya manejado por su componente) -->
      <app-categories-order-dialog
        [visible]="showOrder()"
        (visibleChange)="showOrder.set($event)"
      ></app-categories-order-dialog>
    </section>
  `,
  styles: [`
    :host{ display:block; }
    .categories-page{
      padding:.5rem;
      display:flex;
      flex-direction:column;
      gap:.75rem;
    }
  `]
})
export class CategoriesPage {

  active = signal(true);
  showDeleted = computed(() => !this.active());

  showAdd = signal(false);
  showOrder = signal(false);
  editId = signal<string | null>(null);

  dialogTitle = computed(() => this.editId() ? 'Editar categoría' : 'Agregar categoría');

  onActiveChange(v: boolean){ this.active.set(v); }

  openAdd(){ this.editId.set(null); this.showAdd.set(true); }
  openEdit(id: string){ if (this.active()) { this.editId.set(id); this.showAdd.set(true); this.editId.set(id); } }
  closeAdd(){ this.showAdd.set(false); this.editId.set(null); }
}
