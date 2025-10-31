// src/app/components/categories/categories-order-dialog.component.ts
import { Component, EventEmitter, Output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesStore, Category } from '../../pages/categories/categories.store';

/* PrimeNG v20 */
import { OrderListModule } from 'primeng/orderlist';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-categories-order-dialog',
  standalone: true,
  imports: [CommonModule, OrderListModule, ButtonModule, TagModule, RippleModule],
  template: `
    <div class="content">
      <div class="help">Arrastra para cambiar el orden. Guarda para aplicar.</div>

      <p-orderList
        [value]="uiList()"
        [dragdrop]="true"
        (onReorder)="handleReorder($event)"
        [listStyle]="{ 'width': '100%' }"
      >
        <ng-template let-item pTemplate="item">
          <div class="row">
            <div class="name">{{ item.name }}</div>
            <div class="vis">
              <p-tag [value]="item.visible ? 'Visible' : 'Oculta'"
                     [severity]="item.visible ? 'success' : 'warning'"></p-tag>
            </div>
          </div>
        </ng-template>
      </p-orderList>

      <div class="actions">
        <button pButton type="button" label="Cancelar" class="p-button-text" (click)="close.emit()" pRipple></button>
        <button pButton type="button" label="Guardar" (click)="save()" pRipple></button>
      </div>
    </div>
  `,
  styles: [`
    :host{ display:block; }
    .content{ display:flex; flex-direction:column; gap:.75rem; }
    .help{ color: var(--p-text-muted-color); }

    
    :host ::ng-deep .p-orderlist .p-orderlist-controls { display:none !important; }

    
    :host ::ng-deep .p-orderlist .p-orderlist-list{
      max-height: 360px;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 4px;
    }

    .row{
      display:grid; grid-template-columns: 1fr 140px; gap:.5rem; align-items:center;
      padding:.5rem; border:1px solid var(--p-surface-200); border-radius:.5rem;
      background: var(--p-surface-0);
    }
    .name{ font-weight:600; }
    .vis{ display:flex; justify-content:flex-start; }

    .actions{ display:flex; justify-content:flex-end; gap:.5rem; padding-top:.25rem; }
  `]
})
export class CategoriesOrderDialogComponent {
  @Output() close = new EventEmitter<void>();

  
  uiList = signal<Category[]>([]);

  constructor(private store: CategoriesStore) {
    effect(() => {
      
      this.uiList.set([...this.store.itemsSorted()]);
    });
  }

  handleReorder(ev: any){
    const next: Category[] = ev?.value ?? this.uiList();
    this.uiList.set([...next]);
  }

  save(){
    this.store.applyUiOrder(this.uiList());
    this.close.emit();
  }
}
