import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  computed,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';

type ProductInput = {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-product-add',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputNumberModule, TextareaModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
      [focusOnShow]="false"
      [appendTo]="'body'"
      [autoZIndex]="true"
      [baseZIndex]="4000"
      [style]="{ width: 'min(560px, 92vw)' }"
      [breakpoints]="{ '960px': '80vw', '768px': '90vw', '640px': '100vw' }"
      styleClass="prod-add-dialog"
      (onHide)="onHide()"
    >
      <ng-template pTemplate="header">
        <div class="modal-header">
          <div class="title">{{ product?.name }}</div>
        </div>
      </ng-template>

      <div class="modal-body">
        <p class="desc" *ngIf="product?.description as d; else noDesc">{{ d }}</p>
        <ng-template #noDesc><p class="desc">Breve descripción del producto</p></ng-template>

        <div class="media">
          <img *ngIf="product?.imageUrl; else ph" [src]="product?.imageUrl!" alt="{{ product?.name }}">
          <ng-template #ph>
            <div class="ph"><i class="pi pi-image"></i></div>
          </ng-template>
        </div>

        <div class="notes">
          <label for="notes">Instrucciones especiales</label>
          <textarea
            pTextarea
            id="notes"
            [(ngModel)]="notes"
            rows="3"
            autoResize
            placeholder="Ej.: sin cebolla, extra salsa...">
          </textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="footer">
          <div class="qty">
            <button pButton class="qty-btn" icon="pi pi-minus" (click)="dec()" [text]="true" aria-label="Disminuir"></button>
            <input class="qty-box" type="number" [value]="qty" min="1" (input)="onQtyInput($any($event.target).value)" />
            <button pButton class="qty-btn" icon="pi pi-plus" (click)="inc()" [text]="true" aria-label="Aumentar"></button>
          </div>

          <button
            pButton
            class="confirm-btn"
            [label]="addLabel()"
            (click)="confirmAdd()"
            [disabled]="qty < 1">
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host{ display:block; }

    .prod-add-dialog .p-dialog{ border-radius:0 !important; display:grid; grid-template-rows:auto 1fr auto; max-height:100vh; }
    .prod-add-dialog .p-dialog-header{ padding:.85rem 1rem; border-bottom:1px solid var(--p-surface-200); }
    .prod-add-dialog .p-dialog-content{ padding:0 1rem 1rem; overflow:auto; max-height:calc(100vh - 8rem); }
    .prod-add-dialog .p-dialog-footer{ padding:.75rem 1rem; border-top:1px solid var(--p-surface-200); background:var(--p-surface-0); }

    @media (max-width: 640px){
      .prod-add-dialog .p-dialog{ width:100vw !important; height:100vh !important; max-width:100vw !important; }
      .prod-add-dialog .p-dialog-content{ max-height:calc(100vh - 8rem); }
    }

    .modal-header .title{ font-size:1.2rem; font-weight:700; line-height:1.2; }
    .modal-body{ padding:.25rem 0 .75rem; }
    .desc{ margin:.25rem 0 .75rem; color:var(--p-text-secondary-color); font-size:.95rem; }

    .media{ width:100%; aspect-ratio:16/9; background:var(--p-surface-100); border-radius:.5rem; overflow:hidden; display:grid; place-items:center; margin-bottom:.75rem; }
    .media img{ width:100%; height:100%; object-fit:cover; }
    .media .ph{ width:100%; height:100%; display:grid; place-items:center;
      background:repeating-linear-gradient(45deg,var(--p-surface-100),var(--p-surface-100) 12px,var(--p-surface-200) 12px,var(--p-surface-200) 24px);
      color:var(--p-text-muted-color); font-size:1.4rem; }

    .notes label{ display:block; font-weight:700; margin:.25rem 0 .35rem; }
    .notes textarea{ width:100%; resize:none; }

    .footer{ width:100%; display:flex; align-items:center; gap:.75rem; justify-content:space-between; flex-wrap:wrap; }
    .qty{ display:flex; align-items:center; gap:.5rem; }
    .qty-btn.p-button{ width:36px; height:36px; border-radius:9999px; padding:0; display:inline-flex; align-items:center; justify-content:center;
      background:var(--p-surface-200); color:var(--p-emphasis-high); }
    .qty-box{ width:72px; height:36px; border:1px solid var(--p-surface-300); border-radius:.5rem; text-align:center; background:var(--p-surface-100); font-weight:700; }

    .confirm-btn.p-button{ min-height:40px; padding:.5rem 1.25rem; border-radius:.75rem; font-weight:700; flex:1 1 auto; }
    @media (max-width: 640px){ .confirm-btn.p-button{ width:100%; } }
  `]
})
export class ProductAddComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() product?: ProductInput;
  @Input() initialQty = 1;

  @Output() confirm = new EventEmitter<{ productId: string; qty: number; notes?: string }>();

  qty = 1;
  notes = '';

  addLabel = computed(() => {
    const price = this.product?.price ?? 0;
    const total = Math.max(0, price * this.qty);
    return `Agregar Bs. ${total}`;
  });

  ngOnChanges(changes: SimpleChanges){
    if ('product' in changes || 'initialQty' in changes) {
      this.qty = Math.max(1, Math.floor(this.initialQty || 1));
      this.notes = '';
    }
  }

  onHide(){
    if (this.visible){
      this.visible = false;
      this.visibleChange.emit(false);
    }
  }

  onQtyInput(val: any){
    const n = Math.floor(Number(val));
    this.qty = isNaN(n) ? 1 : Math.max(1, n);
  }
  inc(){ this.qty = Math.max(1, this.qty + 1); }
  dec(){ this.qty = Math.max(1, this.qty - 1); }

  confirmAdd(){
    if (!this.product) return;
    this.confirm.emit({
      productId: this.product.id,
      qty: Math.max(1, this.qty | 0),
      notes: this.notes?.trim() || undefined
    });
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
