// src/app/components/products/products-header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 */
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

type Mode = 'list' | 'add' | 'edit';

@Component({
  selector: 'app-products-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  template: `
    <header class="prods-head">
      <div class="head-left">
        <h2 class="title">{{ title }}</h2>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>

      <div class="head-right">
        <button *ngIf="mode === 'list'"
                pButton type="button" label="Agregar producto" icon="pi pi-plus"
                class="p-button-sm" (click)="addClick.emit()" pRipple></button>

        <button *ngIf="mode !== 'list'"
                pButton type="button" label="Volver a lista" icon="pi pi-arrow-left"
                class="p-button-sm p-button-secondary" (click)="backClick.emit()" pRipple></button>
      </div>
    </header>
  `,
  styles: [`
    :host{ display:block; }

    .prods-head{
      display:flex; align-items:flex-end; justify-content:space-between;
      gap:.5rem; padding:.25rem .25rem .5rem;
    }

    .head-left{ display:flex; flex-direction:column; gap:.15rem; }
    .title{ margin:0; font-size:1.15rem; font-weight:700; color: var(--p-surface-900); }
    .subtitle{ margin:0; color: var(--p-surface-600); font-size:.95rem; }

    .head-right{ display:flex; align-items:center; gap:.5rem; }
  `]
})
export class ProductsHeaderComponent {
  @Input() title = 'Productos';
  @Input() subtitle?: string;
  @Input() mode: Mode = 'list';

  @Output() addClick = new EventEmitter<void>();
  @Output() backClick = new EventEmitter<void>();
}
