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
import { SelectModule } from 'primeng/select';

import type { ItemStatus } from '../../pages/orders/orders.types';

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
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputNumberModule, TextareaModule, SelectModule],
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
      [style]="{ width: 'min(480px, 92vw)' }"
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

        <!-- Select de estado: solo en modo edición -->
        <div class="status" *ngIf="showStatus">
          <label for="itemStatus">Estado del producto</label>
          <p-select
            id="itemStatus"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            [(ngModel)]="itemStatus"
            placeholder="Selecciona el estado"
            [appendTo]="'body'"
            [scrollHeight]="'220px'">
          </p-select>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <!-- fila inferior -->
        <div class="footer">
          <!-- Cantidad pegada a la izquierda -->
          <div class="qty">
            <button pButton class="qty-btn" icon="pi pi-minus" (click)="dec()" [text]="true" aria-label="Disminuir"></button>
            <input class="qty-box" type="number" [value]="qty" min="1" (input)="onQtyInput($any($event.target).value)" />
            <button pButton class="qty-btn" icon="pi pi-plus" (click)="inc()" [text]="true" aria-label="Aumentar"></button>
          </div>

          <!-- Botón Agregar ocupa el resto -->
          <button
            pButton
            class="confirm-btn"
            (click)="confirmAdd()"
            [disabled]="qty < 1">
            {{ addLabel() }}
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host{ display:block; }

    /* === Esquinas rectas del modal === */
    .p-dialog.prod-add-dialog{
      --p-dialog-border-radius: 0px;
      border-radius: 0 !important;
    }
    .p-dialog.prod-add-dialog .p-dialog-header,
    .p-dialog.prod-add-dialog .p-dialog-content,
    .p-dialog.prod-add-dialog .p-dialog-footer{
      border-radius: 0 !important;
    }

    /* Aire en header/content/footer */
    .p-dialog.prod-add-dialog .p-dialog-header{
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--p-surface-200);
    }
    .p-dialog.prod-add-dialog .p-dialog-content{
      padding: .5rem 1.25rem 1.25rem;
      max-height: calc(100vh - 8rem);
      overflow: auto;
    }

    /* ====== CLAVE para alinear a la izquierda EXACTO ====== */
    .p-dialog.prod-add-dialog .p-dialog-footer{
      display: flex;                 /* forzamos flex en el propio footer del diálogo */
      align-items: center;
      justify-content: flex-start;   /* nada centrado por el tema */
      gap: .9rem;
      padding: .9rem 1.25rem;        /* mismo padding lateral que el content */
      border-top: 1px solid var(--p-surface-200);
      background: var(--p-surface-0);
    }

    /* La fila interna ocupa todo el ancho y no añade márgenes extra */
    .footer{
      display: contents;             /* evita añadir márgenes/padding propios */
    }

    .modal-body{ display:grid; gap:.9rem; }
    .desc{ margin:.1rem 0 .4rem; color:var(--p-text-muted-color); font-size:.95rem; }
    .media{
      width:100%; height:200px;
      display:grid; place-items:center;
      border-radius:.5rem; overflow:hidden;
      border:1px dashed var(--p-surface-300);
      background:var(--p-surface-50);
    }
    .media img{ width:100%; height:100%; object-fit:cover; display:block; }
    .media .ph{ width:100%; height:100%; display:grid; place-items:center; color:var(--p-text-muted-color); }
    .notes{ display:grid; gap:.4rem; }
    .notes label{ font-weight:600; font-size:.95rem; }
    .status{ display:grid; gap:.4rem; }
    .status label{ font-weight:600; font-size:.95rem; }

    /* Elementos de cantidad */
    .qty{
      display:flex;
      align-items:center;
      gap:.55rem;
      flex: 0 0 auto;       /* no crece: queda pegado al borde izquierdo del padding */
    }
    .qty-btn.p-button{ width:2.25rem; height:2.25rem; border-radius:.75rem; }
    .qty-box{
      width:4rem; height:2.25rem; text-align:center;
      border:1px solid var(--p-surface-300);
      border-radius:.75rem;
      background:var(--p-surface-0);
      font-weight:700;
    }

    /* Botón Agregar ocupa el resto del ancho disponible */
    .confirm-btn.p-button{
      min-height:42px;
      padding:.65rem 1.25rem;
      border-radius:.75rem;
      font-weight:700;

      flex: 1 1 auto;       /* se expande para llenar el resto */
      width: auto;
      min-width: 0;
    }

    /* Panel del Select por encima del diálogo */
    :host ::ng-deep .p-select-panel{ z-index: 5001; }

    /* Móvil: full-screen y centrado vertical */
    @media (max-width: 640px){
      .p-dialog.prod-add-dialog{
        position: fixed !important;
        inset: 0 !important;
        transform: none !important;
        width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        margin: 0 !important;
      }
      .p-dialog.prod-add-dialog .p-dialog-content{
        padding: .5rem 1rem 1rem;
        max-height: calc(100vh - 8rem);
      }

      /* en móvil, centramos y el botón al 100% */
      .p-dialog.prod-add-dialog .p-dialog-footer{
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: .75rem;
      }
      .confirm-btn.p-button{ width: 100%; }
    }
  `]
})
export class ProductAddComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() product?: ProductInput;
  @Input() initialQty = 1;

  @Input() showStatus = false;
  @Input() initialStatus?: ItemStatus;

  @Output() confirm = new EventEmitter<{ productId: string; qty: number; notes?: string; itemStatus?: ItemStatus }>();

  qty = 1;
  notes = '';

  itemStatus: ItemStatus = 'EN_PREPARACION';
  statusOptions = [
    { label: 'En preparación', value: 'EN_PREPARACION' as ItemStatus },
    { label: 'Preparado', value: 'PREPARADO' as ItemStatus },
    { label: 'Entregado', value: 'ENTREGADO' as ItemStatus },
  ];

  addLabel = computed(() => 'Agregar');

  ngOnChanges(changes: SimpleChanges){
    if ('product' in changes || 'initialQty' in changes) {
      this.qty = Math.max(1, Math.floor(this.initialQty || 1));
      this.notes = '';
      if (this.showStatus) this.itemStatus = (this.initialStatus ?? 'EN_PREPARACION') as ItemStatus;
    }
  }

  onHide(){
    if (this.visible){
      this.visible = false;
      this.visibleChange.emit(false);
    }
  }

  onQtyInput(val: any){
    const n = Math.floor(Number(val) || 1);
    this.qty = Math.max(1, n);
  }

  inc(){ this.qty = Math.max(1, this.qty + 1); }
  dec(){ this.qty = Math.max(1, this.qty - 1); }

  confirmAdd(){
    if (!this.product) return;
    const payload: { productId: string; qty: number; notes?: string; itemStatus?: ItemStatus } = {
      productId: this.product.id,
      qty: Math.max(1, this.qty | 0),
      notes: this.notes?.trim() || undefined
    };
    if (this.showStatus) payload.itemStatus = this.itemStatus;
    this.confirm.emit(payload);
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
