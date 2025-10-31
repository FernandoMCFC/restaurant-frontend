// src/app/components/categories/categories-list.component.ts
import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesStore, Category } from '../../pages/categories/categories.store';

/* PrimeNG v20 */
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, RippleModule],
  template: `
    <div class="card">
      <p-table
        [value]="rows()"
        dataKey="id"
        class="p-dense nicer-table"
        [tableStyle]="{ 'min-width': '780px' }"
        [rowHover]="true"
        [stripedRows]="true"
      >
        <ng-template pTemplate="header">
          <tr>
            <th class="col-id">ID</th>
            <th>Nombre</th>
            <th class="col-vis">Visibilidad</th>
            <th class="col-actions">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td class="col-id mono">{{ item.id }}</td>
            <td class="name">
              <i class="pi pi-tag name-icon" aria-hidden="true"></i>
              <span class="name-text">{{ item.name }}</span>
            </td>
            <td class="col-vis">
              <p-tag [value]="item.visible ? 'Visible' : 'Oculta'"
                     [severity]="item.visible ? 'success' : 'warning'"></p-tag>
            </td>
            <td class="col-actions">
              <button pButton type="button" icon="pi pi-pencil"
                      class="p-button-text p-button-sm"
                      (click)="edit.emit(item.id)" pRipple aria-label="Editar"
                      [disabled]="showDeleted"></button>

              <button pButton type="button" icon="pi pi-trash"
                      class="p-button-text p-button-danger p-button-sm"
                      (click)="onRemove(item.id)" pRipple aria-label="Eliminar"
                      [disabled]="showDeleted"></button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="empty">
          <tr><td colspan="4" class="empty">No hay categorías.</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .card{
      background: var(--p-surface-0);
      border: 1px solid var(--p-content-border-color, var(--p-surface-200));
      border-radius: .75rem;
      padding: .75rem;
      box-shadow: var(--p-shadow-1);
    }

    :host ::ng-deep .nicer-table .p-datatable-wrapper{
      border: 1px solid var(--p-surface-200);
      border-radius: .65rem;
      overflow: hidden;
    }
    :host ::ng-deep .nicer-table .p-datatable-thead > tr > th{
      position: sticky; top: 0; z-index: 1;
      background: color-mix(in oklab, var(--p-surface-100) 85%, var(--p-surface-0));
      color: var(--p-text-color);
      font-weight: 700;
      padding: .65rem .75rem;
      border-width: 0 0 1px 0;
      border-color: var(--p-surface-200);
      letter-spacing: .2px;
    }
    :host ::ng-deep .nicer-table .p-datatable-tbody > tr > td{
      padding: .6rem .75rem;
      border-width: 0 0 1px 0;
      border-color: var(--p-surface-200);
      vertical-align: middle;
    }
    :host ::ng-deep .nicer-table .p-datatable-tbody > tr:hover{
      background: color-mix(in oklab, var(--p-primary-50) 50%, transparent);
      transition: background .15s ease;
    }

    .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .col-id{ width: 260px; }
    .col-vis{ width: 160px; }
    .col-actions{ width: 170px; text-align:left; white-space: nowrap; }

    .name{
      display:flex; align-items:center; gap:.5rem;
      max-width: 520px;
    }
    .name-icon{ color: var(--p-text-muted-color); font-size: .95rem; }
    .name-text{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .empty{ text-align:center; padding: 1rem; color: var(--p-text-muted-color); }

    @media (max-width: 900px){
      .col-id{ width: 200px; }
      .name{ max-width: 420px; }
    }
    @media (max-width: 768px){
      .col-id{ display:none; }
      .mono{ display:none; }
      .col-actions{ width: 150px; }
      .name{ max-width: none; }
    }
  `]
})
export class CategoriesListComponent {
  
  @Input() showDeleted = false;

  @Output() edit = new EventEmitter<string>();

  rows = signal<Category[]>([]);

  constructor(public store: CategoriesStore) {
    effect(() => {
      this.rows.set(this.showDeleted ? [...this.store.itemsDeleted()] : [...this.store.itemsActive()]);
    });
  }

  
  ngOnChanges() {
    this.rows.set(this.showDeleted ? [...this.store.itemsDeleted()] : [...this.store.itemsActive()]);
  }

  onRemove(id: string) {
    if (!this.showDeleted) {
      this.store.remove(id); 
    }
  }
}
