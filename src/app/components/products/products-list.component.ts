// src/app/components/products/products-list.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 */
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import { ProductsStore } from '../../pages/products/products.store';
import type { Product } from '../../pages/products/products.types';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, RippleModule],
  template: `
    <p-table [value]="rows"
             [tableStyle]="{ 'min-width': '640px' }"
             class="nicer-table"
             [paginator]="false">
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
            <i class="pi pi-box name-icon" aria-hidden="true"></i>
            <span class="name-text">{{ item.name }}</span>
          </td>
          <td class="col-vis">
            <p-tag [value]="item.visibleForClients ? 'Visible' : 'Oculto'"
                   [severity]="item.visibleForClients ? 'success' : 'warn'">
            </p-tag>
          </td>
          <td class="col-actions">
            <button pButton type="button" class="p-button-text p-button-sm"
                    icon="pi pi-pencil" (click)="onEdit(item)" pRipple></button>
            <button pButton type="button" class="p-button-text p-button-danger p-button-sm"
                    icon="pi pi-trash" (click)="onRemove(item.id)" pRipple></button>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [`
    :host{ display:block; }

    :host ::ng-deep .nicer-table .p-datatable-header{
      padding:.5rem .75rem;
    }
    :host ::ng-deep .nicer-table .p-datatable-thead > tr > th{
      background: var(--p-surface-50);
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

    .col-id{ width: 180px; }
    .col-vis{ width: 130px; }
    .col-actions{ width: 130px; text-align:right; }

    .name{ display:flex; align-items:center; gap:.5rem; }
    .name-icon{ font-size: 1rem; opacity:.8; }
    .name-text{ font-weight:600; }
  `]
})
export class ProductsListComponent {
  rows: Product[] = [];

  @Output() edit = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<string>();

  constructor(private store: ProductsStore) {
    this.rows = this.store.products();
    // Si luego quieres reactividad con señales, agrega un effect() aquí.
  }

  onEdit(item: Product){ this.edit.emit(item); }
  onRemove(id: string){ this.remove.emit(id); }
}
