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
      [closable]="false"           
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
          <!-- Botón personalizado con tu PNG -->
          <button type="button" class="close-btn" (click)="onHide()" aria-label="Cerrar"></button>
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

        <!-- Estado del producto: tarjetas clicables -->
        <div class="status-section" *ngIf="showStatus">
          <label class="status-label">Estado del producto</label>
          <div class="status-options">
            <div
              *ngFor="let option of statusOptions"
              class="status-option"
              [class.active]="itemStatus === option.value"
              [class.status-preparacion]="option.value === 'EN_PREPARACION'"
              [class.status-preparado]="option.value === 'PREPARADO'"
              [class.status-entregado]="option.value === 'ENTREGADO'"
              (click)="itemStatus = option.value">
              <div class="status-indicator"></div>
              <div class="status-content">
                <span class="status-title">{{ option.label }}</span>
                <span class="status-description">{{ getStatusDescription(option.value) }}</span>
              </div>
              <i class="pi pi-check status-check" *ngIf="itemStatus === option.value"></i>
            </div>
          </div>
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

    .p-dialog.prod-add-dialog{
      --p-dialog-border-radius: 12px;
      border-radius: 12px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--p-surface-200);
    }
    .p-dialog.prod-add-dialog .p-dialog-header,
    .p-dialog.prod-add-dialog .p-dialog-content,
    .p-dialog.prod-add-dialog .p-dialog-footer{
      border-radius: 12px !important;
    }

    .p-dialog.prod-add-dialog .p-dialog-header{
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid var(--p-surface-100);
      background: linear-gradient(135deg, var(--p-surface-0) 0%, var(--p-surface-50) 100%);
    }
    .modal-header{
      display:flex; align-items:center; justify-content:space-between; gap:.75rem;
      width:100%;
    }
    .modal-header .title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--p-text-color);
      margin: 0;
    }

    /* === BOTÓN DE CIERRE PERSONALIZADO ===
       - Ajusta el tamaño AQUÍ (área clickeable) */
    .close-btn{
      display:inline-grid; place-items:center;
      width: 3.5rem;               /* ⬅️ Cambia este valor para hacerlo más grande/pequeño */
      height: 3.5rem;              /* ⬅️ Cambia este valor para hacerlo más grande/pequeño */
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      position: relative;
    }
    /* - Ajusta el tamaño del ícono AQUÍ */
    .close-btn::before{
      content: '';
      display:block;
      width: 2.4rem;               /* ⬅️ Tamaño del PNG dentro del botón */
      height: 2.4rem;              /* ⬅️ Tamaño del PNG dentro del botón */
      background: url('/icons/delete.png') center / contain no-repeat;
    }

    .p-dialog.prod-add-dialog .p-dialog-content{
      padding: 1rem 1.5rem 1.5rem;
      max-height: calc(100vh - 8rem);
      overflow: auto;
    }
    .modal-body{ display:grid; gap:1.25rem; }

    .desc{
      margin:0;
      color:var(--p-text-color);
      font-size:.95rem;
      line-height: 1.5;
      padding: 0.75rem;
      background: var(--p-surface-50);
      border-radius: 8px;
      border-left: 4px solid var(--p-primary-500);
    }

    .media{
      width:100%;
      height:220px;
      display:grid; place-items:center;
      border-radius:12px; overflow:hidden;
      border:2px solid var(--p-surface-200);
      background:var(--p-surface-50);
    }
    .media img{ width:100%; height:100%; object-fit:cover; display:block; }
    .media .ph{ width:100%; height:100%; display:grid; place-items:center; color:var(--p-text-muted-color); }

    .notes{ display:grid; gap:.75rem; }
    .notes label{ font-weight:600; font-size:.95rem; color: var(--p-text-color); }
    .notes textarea{
      border: 2px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 0.75rem;
      transition: border-color 0.2s ease, box-shadow .2s ease;
      width: 100%;
      box-sizing: border-box;
      min-height: 7.5rem;
    }
    .notes textarea:focus{
      border-color: var(--p-primary-500);
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-primary-500) 20%, transparent);
    }

    .status-section{ display:grid; gap: 1rem; }
    .status-label{ font-weight:600; font-size:.95rem; color: var(--p-text-color); margin-bottom:.5rem; }
    .status-options{ display:grid; gap:.75rem; }

    .status-option{
      display:flex; align-items:center; gap:1rem;
      padding: 1rem 1.25rem;
      border: 2px solid var(--p-surface-200);
      border-radius: 12px;
      background: var(--p-surface-0);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      text-align: left;
      width: 100%;
    }
    .status-option:hover{
      border-color: var(--p-surface-300);
      background: var(--p-surface-50);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .status-option.active{
      border-color: var(--p-primary-500);
      background: color-mix(in srgb, var(--p-primary-500) 10%, white);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--p-primary-500) 20%, transparent);
    }

    .status-indicator{ width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; transition: all 0.3s ease; }
    .status-option.active .status-indicator{ width: 16px; height: 16px; box-shadow: 0 0 0 4px color-mix(in srgb, var(--p-primary-500) 25%, transparent); }
    .status-preparacion .status-indicator{ background: #f59e0b; }
    .status-preparado   .status-indicator{ background: #10b981; }
    .status-entregado   .status-indicator{ background: #3b82f6; }

    .status-content{ flex:1; display:flex; flex-direction:column; gap:.25rem; }
    .status-title{ font-weight:600; font-size:.95rem; color: var(--p-text-color); }
    .status-description{ font-size:.85rem; color: var(--p-text-muted-color); line-height:1.4; }

    .status-check{ color: var(--p-primary-600); font-size: 1.1rem; opacity: 0; transition: opacity 0.3s ease; }
    .status-option.active .status-check{ opacity: 1; }

    .p-dialog.prod-add-dialog .p-dialog-footer{
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--p-surface-100);
      background: var(--p-surface-0);
    }
    .footer{ display: contents; }

    .qty{ display:flex; align-items:center; gap:.75rem; flex: 0 0 auto; }
    .qty-btn.p-button{
      width:2.5rem; height:2.5rem; border-radius:10px;
      border: 2px solid var(--p-surface-200); background: var(--p-surface-0);
      transition: all 0.2s ease;
    }
    .qty-btn.p-button:hover{ background: var(--p-surface-100); border-color: var(--p-primary-500); }
    .qty-box{
      width:4rem; height:2.5rem; text-align:center;
      border:2px solid var(--p-surface-200); border-radius:10px;
      background:var(--p-surface-0); font-weight:700; font-size: 1rem;
      transition: border-color 0.2s ease;
    }
    .qty-box:focus{ border-color: var(--p-primary-500); outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-primary-500) 20%, transparent); }

    .confirm-btn.p-button{
      min-height:3rem; padding:.75rem 2rem; border-radius:10px;
      font-weight:700; font-size: 1rem;
      background: var(--p-primary-500); border: 2px solid var(--p-primary-500);
      transition: all 0.2s ease;
      flex: 1 1 auto; width: auto; min-width: 0;
    }
    .confirm-btn.p-button:hover:not(:disabled){
      background: var(--p-primary-600);
      border-color: var(--p-primary-600);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--p-primary-500) 30%, transparent);
    }
    .confirm-btn.p-button:disabled{ opacity:.6; cursor: not-allowed; }

    @media (max-width: 640px){
      .p-dialog.prod-add-dialog{
        position: fixed !important;
        inset: 0 !important;
        transform: none !important;
        width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      .p-dialog.prod-add-dialog .p-dialog-content{
        padding: 1rem 1rem 1.5rem;
        max-height: calc(100vh - 8rem);
      }
      .p-dialog.prod-add-dialog .p-dialog-header { padding: 1.25rem 1rem 1rem; }
      .status-option { padding: 0.875rem 1rem; }
      .p-dialog.prod-add-dialog .p-dialog-footer{
        flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
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

  getStatusDescription(status: ItemStatus): string {
    switch (status) {
      case 'EN_PREPARACION': return 'El producto está siendo preparado en cocina';
      case 'PREPARADO':      return 'El producto está listo para servir';
      case 'ENTREGADO':      return 'El producto ha sido entregado al cliente';
      default:               return '';
    }
  }

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
