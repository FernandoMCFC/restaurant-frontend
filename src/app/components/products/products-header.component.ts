import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 */
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RippleModule, ToggleSwitchModule],
  template: `
    <header class="prods-head">
      <h2 class="title">{{ title }}</h2>

      <!-- Subtitulo -->
      <div class="subline">
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>

        <div class="switch">
          <span class="lbl">Activos</span>
          <p-toggleSwitch
            [ngModel]="active"
            (ngModelChange)="activeChange.emit($event)">
          </p-toggleSwitch>
        </div>
      </div>

      <!-- Boton Agregar -->
      <div class="btn-row">
        <button
          pButton
          type="button"
          label="Agregar"
          icon="pi pi-plus"
          class="add-btn"
          (click)="addClick.emit()"
          pRipple>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host{ display:block; }

    .prods-head{
      display:flex;
      flex-direction:column;
      gap:.4rem;
      padding:.25rem .25rem .5rem;
    }

    .title{
      margin:0;
      font-size:1.25rem;
      font-weight:700;
      line-height:1.2;
    }

    .subline{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:.5rem;
    }

    .subtitle{
      margin:0;
      color: var(--p-text-muted-color);
    }

    /* Chip + Toggle */
    .switch{
      display:flex;
      align-items:center;
      gap:.5rem;
      padding:.25rem .6rem;
      background: color-mix(in oklab, var(--p-surface-100) 65%, var(--p-surface-0));
      border:1px solid var(--p-surface-200);
      border-radius: 999px;
      white-space: nowrap;
    }
    .switch .lbl{
      font-size:.85rem;
      font-weight:600;
      color: var(--p-text-color);
    }

    :host ::ng-deep .switch .p-toggleswitch{
      width: 46px;
      height: 26px;
    }
    :host ::ng-deep .switch .p-toggleswitch-slider{
      background: color-mix(in oklab, var(--p-surface-300) 80%, var(--p-surface-0));
      border-radius: 999px;
      transition: background .18s ease;
    }
    :host ::ng-deep .switch .p-toggleswitch-handle{
      position:absolute;
      top:2px;
      left:2px;
      width:22px;
      height:22px;
      border-radius:50%;
      background: var(--p-surface-0);
      box-shadow: 0 1px 2px rgba(0,0,0,.15);
      transition: transform .18s ease;
    }
    :host ::ng-deep .switch .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider{
      background: var(--p-primary-color);
    }
    :host ::ng-deep .switch .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle{
      transform: translateX(20px);
    }

    .btn-row{
      display:flex;
      gap:.5rem;
      align-items:center;
      margin-top:.25rem;
      flex-wrap:wrap;
    }

    /* Boton Agregar */
    .add-btn{
      min-height: 2.4rem;
      padding-inline: 1.2rem;
      border-radius: 999px;
      font-size:.9rem;
      font-weight:600;
    }

    :host ::ng-deep .add-btn .p-button-label{
      padding-inline:.8rem;
    }

    @media (max-width:768px){
      .subline{
        flex-direction:column;
        align-items:flex-start;
        gap:.25rem;
      }
      .switch{ align-self:flex-start; }
      .btn-row{ flex-wrap:wrap; }
    }
  `]
})
export class ProductsHeaderComponent {
  @Input() title = 'Productos';
  @Input() subtitle = 'Listado de productos registrados.';
  @Input() active = true;

  @Output() activeChange = new EventEmitter<boolean>();
  @Output() addClick = new EventEmitter<void>();
}
