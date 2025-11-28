// src/app/components/menus/menus-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 */
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import type { Menu } from '../../pages/menus/menus.types';
import type {
  Product,
  ProductCategory,
} from '../../pages/products/products.types';

@Component({
  selector: 'app-menus-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, RippleModule],
  template: `
    <p-table
      [value]="menus"
      dataKey="id"
      responsiveLayout="scroll"
      styleClass="p-datatable-sm menus-table"
    >
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 6rem">ID</th>
          <th style="width: 55%">Nombre</th>
          <th style="width: 8rem">Fecha</th>
          <th style="width: 6rem; text-align: center">Acciones</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-menu>
        <tr>
          <td class="col-id">
            {{ menu.id }}
          </td>

          <td class="col-name">
            <span class="name">{{ menu.name }}</span>
          </td>

          <td class="col-date">
            {{ menu.date }}
          </td>

          <td class="col-actions">
            <button
              pButton
              pRipple
              type="button"
              class="icon-btn"
              (click)="onEdit(menu)"
              title="Editar"
            >
              <img src="/icons/edit.png" alt="Editar" />
            </button>

            <button
              pButton
              pRipple
              type="button"
              class="icon-btn danger"
              (click)="onRemove(menu.id)"
              title="Eliminar"
            >
              <img src="/icons/delete.png" alt="Eliminar" />
            </button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="4" class="emptymessage">
            No hay menús registrados.
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .menus-table {
        width: 100%;
      }

      .col-id {
        font-size: 0.85rem;
        color: var(--text-color-secondary);
        white-space: nowrap;
      }

      .col-name {
        max-width: 260px;
      }

      .col-name .name {
        font-weight: 600;
        word-break: break-word;
      }

      .col-date {
        font-size: 0.9rem;
        white-space: nowrap;
      }

      .col-actions {
        text-align: center;
        white-space: nowrap;
      }

      /* Botones de acción: solo el ícono, sin fondo */
      .icon-btn.p-button {
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
        width: 2rem;
        height: 2rem;
        padding: 0;
        margin: 0 0.15rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .icon-btn.p-button:hover {
        background: transparent !important;
      }

      .icon-btn img {
        width: 1.1rem;
        height: 1.1rem;
        object-fit: contain;
        display: block;
      }

      .icon-btn.danger img {
        filter: hue-rotate(-10deg) saturate(1.4);
      }

      .emptymessage {
        text-align: center;
        padding: 1.5rem 0;
      }
    `,
  ],
})
export class MenusListComponent {
  @Input() menus: Menu[] = [];
  @Input() categories: ProductCategory[] = [];
  @Input() products: Product[] = [];

  @Output() edit = new EventEmitter<Menu>();
  @Output() remove = new EventEmitter<string>();

  onEdit(menu: Menu) {
    this.edit.emit(menu);
  }

  onRemove(id: string) {
    this.remove.emit(id);
  }
}
