import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
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
    <div class="card">
      <p-table
        [value]="rows()"
        [tableStyle]="{ 'min-width': '620px' }"
        class="nicer-table"
        [rowHover]="true"
        [stripedRows]="true"
      >
        <ng-template pTemplate="header">
          <tr>
            <th class="col-id">ID</th>
            <th class="col-name">Nombre</th>
            <th class="col-price">Precio</th>
            <th class="col-vis">Visibilidad</th>
            <th class="col-actions">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td class="col-id mono">{{ item.id }}</td>

            <td class="name col-name">
              <i class="pi pi-box name-icon" aria-hidden="true"></i>
              <span class="name-text">{{ item.name }}</span>
            </td>

            <td class="col-price">
              <span *ngIf="item.price != null">{{ item.price | number:'1.2-2' }} Bs.</span>
            </td>

            <td class="col-vis">
              <p-tag
                [value]="item.visibleForClients ? 'Visible' : 'Oculto'"
                [severity]="item.visibleForClients ? 'success' : 'warn'"
                styleClass="cat-tag">
              </p-tag>
            </td>

            <td class="col-actions">
              <button
                type="button"
                class="icon-btn"
                (click)="onEdit(item)"
                pRipple
                aria-label="Editar">
                <img src="/icons/edit.png" alt="Editar" />
              </button>

              <button
                type="button"
                class="icon-btn"
                (click)="onRemove(item.id)"
                pRipple
                aria-label="Eliminar">
                <img src="/icons/delete.png" alt="Eliminar" />
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="empty">
          <tr>
            <td colspan="5" class="empty">No hay productos.</td>
          </tr>
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
      font-size: .9rem;
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

    /* Más espacio para Visible/Oculto */
    :host ::ng-deep .cat-tag.p-tag{
      padding: .18rem .9rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: .8rem;
      letter-spacing: .02em;
    }

    .mono{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
                   "Liberation Mono", "Courier New", monospace;
    }

    .col-id{ width: 180px; max-width: 220px; }
    .col-name{ width: auto; }
    .col-price{ width: 150px; text-align:left; }
    .col-vis{ width: 150px; }
    .col-actions{ width: 160px; text-align:left; white-space: nowrap; }

    .name{
      display:flex; align-items:center; gap:.5rem;
      min-width: 0;
    }
    .name-icon{ color: var(--p-primary-color); font-size: 1rem; opacity:.9; }
    .name-text{
      font-weight:600;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .empty{
      text-align:center;
      padding: 1.5rem .5rem;
      color: var(--p-text-muted-color);
      font-style: italic;
    }

    /* Botones de acción solo con icono PNG, un poco más grandes y separados */
    .icon-btn{
      border: none;
      background: transparent;
      padding: .25rem;       /* antes .15rem */
      border-radius: .4rem;
      cursor: pointer;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      margin-right: .5rem;   /* separación entre botones */
    }
    .icon-btn:last-child{
      margin-right: 0;
    }
    .icon-btn img{
      width: 1.3rem;         /* antes 1.1rem */
      height: 1.3rem;
      display:block;
    }

    @media (max-width: 768px){
      .col-id{ display:none; }
    }
  `]
})
export class ProductsListComponent {
  @Input() showUnavailable = false;

  @Output() edit = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<string>();

  rows = signal<Product[]>([]);

  constructor(public store: ProductsStore) {
    effect(() => {
      this.applyFilter();
    });
  }

  ngOnChanges() {
    this.applyFilter();
  }

  private applyFilter() {
    const all = this.store.products();
    const filtered = this.showUnavailable
      ? all.filter(p => p.available === false)
      : all.filter(p => p.available !== false);
    this.rows.set(filtered);
  }

  onEdit(item: Product){ this.edit.emit(item); }
  onRemove(id: string){ this.remove.emit(id); }
}
