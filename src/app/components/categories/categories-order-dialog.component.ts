// src/app/components/categories/categories-order-dialog.component.ts 
import { Component, EventEmitter, Input, Output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesStore, Category } from '../../pages/categories/categories.store';

import { DialogModule } from 'primeng/dialog';
import { OrderListModule } from 'primeng/orderlist';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-categories-order-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, OrderListModule, ButtonModule, TagModule, RippleModule],
  template: `
    <p-dialog
      [visible]="visible"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="false"
      [style]="{ width: '720px', maxWidth: '96vw' }"
    >
      <ng-template pTemplate="header">
        <div class="dlg-header">
          <h2 class="dlg-title">Ordenar categorías</h2>
          <button type="button" class="dlg-close" (click)="onVisibleChange(false)">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </ng-template>

      <div class="content">
        <div class="help">Arrastra para cambiar el orden. Guarda para aplicar.</div>

        <p-orderList
          [value]="uiList()"
          [dragdrop]="true"
          (onReorder)="handleReorder($event)"
          [listStyle]="{ width: '100%' }"
        >
          <ng-template let-item pTemplate="item">
            <div class="row">
              <div class="name">{{ item.name }}</div>
              <div class="vis">
                <p-tag
                  [value]="item.visible ? 'Visible' : 'Oculta'"
                  [severity]="item.visible ? 'success' : 'warning'"
                  styleClass="cat-tag"
                ></p-tag>
              </div>
            </div>
          </ng-template>
        </p-orderList>

        <div class="actions">
          <button
            pButton
            type="button"
            label="Cancelar"
            class="p-button-text"
            (click)="onVisibleChange(false)"
            pRipple
          ></button>

          <button
            pButton
            type="button"
            label="Guardar"
            (click)="save()"
            pRipple
          ></button>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    :host{ display:block; }

    :host ::ng-deep .p-dialog .p-dialog-header{
      padding:1rem 1.75rem .75rem;
    }
    :host ::ng-deep .p-dialog .p-dialog-header .p-dialog-header-content{
      width:100%;
    }
    :host ::ng-deep .p-dialog .p-dialog-content{
      padding:.75rem 1.75rem 1.5rem;
    }

    .dlg-header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      width:100%;
      gap:1rem;
    }
    .dlg-title{
      margin:0;
      font-size:1.35rem;
      font-weight:700;
      color:var(--p-text-color);
    }
    .dlg-close{
      width:2.4rem;
      height:2.4rem;
      border-radius:999px;
      border:none;
      background:var(--p-primary-500);
      color:#fff;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      padding:0;
    }
    .dlg-close i{
      font-size:1.1rem;
    }
    .dlg-close:hover{
      filter:brightness(.96);
    }

    .content{
      display:flex;
      flex-direction:column;
      gap:.75rem;
    }
    .help{
      color:var(--p-text-muted-color);
      font-size:.9rem;
    }

    :host ::ng-deep .p-orderlist .p-orderlist-controls{
      display:none !important;
    }
    :host ::ng-deep .p-orderlist .p-orderlist-list{
      max-height:360px;
      overflow-y:auto;
      overflow-x:hidden;
      padding-right:4px;
    }
    :host ::ng-deep .p-orderlist .p-orderlist-item{
      padding:.2rem 0;
      border:0;
      background:transparent;
    }

    .row{
      position:relative;
      display:grid;
      grid-template-columns:minmax(0,1fr) 140px;
      gap:.75rem;
      align-items:center;
      padding:.65rem 1rem;
      border:1px solid var(--p-surface-200);
      border-radius:.75rem;
      background:var(--p-surface-0);
      min-height:3rem;
      width:100%;
      box-sizing:border-box;
    }
    .row::before{
      content:'';
      position:absolute;
      left:.55rem;
      top:.4rem;
      bottom:.4rem;
      width:3px;
      border-radius:999px;
      background:var(--p-primary-300);
    }

    .name{
      font-weight:600;
      color:var(--p-text-color);
      padding-left:.4rem;
    }
    .vis{
      display:flex;
      justify-content:flex-end;
    }

    :host ::ng-deep .cat-tag.p-tag{
      padding:.18rem .9rem;
      border-radius:999px;
      font-weight:600;
      font-size:.8rem;
      letter-spacing:.02em;
    }

    .actions{
      display:flex;
      justify-content:flex-end;
      gap:.5rem;
      padding-top:.75rem;
      margin-top:.5rem;
      border-top:1px solid var(--p-surface-200);
    }
    :host ::ng-deep .actions .p-button{
      padding:.35rem 1.2rem;
      border-radius:.75rem;
    }
  `]
})
export class CategoriesOrderDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  uiList = signal<Category[]>([]);

  constructor(private store: CategoriesStore) {
    effect(() => {
      this.uiList.set([...this.store.itemsSorted()]);
    });
  }

  onVisibleChange(v: boolean){
    this.visibleChange.emit(v);
  }

  handleReorder(ev: any){
    const next: Category[] = ev?.value ?? this.uiList();
    this.uiList.set([...next]);
  }

  save(){
    this.store.applyUiOrder(this.uiList());
    this.onVisibleChange(false);
  }
}
