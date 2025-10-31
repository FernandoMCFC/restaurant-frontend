
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 */
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RippleModule, ToggleSwitchModule],
  template: `
    <header class="cats-head">
      <h2 class="title">{{ title }}</h2>

      <!-- Subtitulo a la izquierda + switch a la derecha -->
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

      <!-- Botones debajo del subtítulo -->
      <div class="btn-row">
        <button pButton type="button" label="Agregar" icon="pi pi-plus"
                class="p-button-sm" (click)="addClick.emit()" pRipple></button>
        <button pButton type="button" label="Ordenar" icon="pi pi-sort"
                class="p-button-sm p-button-secondary" (click)="orderClick.emit()" pRipple></button>
      </div>
    </header>
  `,
  styles: [`
    :host{ display:block; }

    .cats-head{
      display:flex; flex-direction:column;
      gap:.4rem; padding:.25rem .25rem .5rem;
    }

    .title{ margin:0; font-size:1.25rem; font-weight:700; line-height:1.2; }

    .subline{
      display:flex; align-items:center; justify-content:space-between; gap:.5rem;
    }
    .subtitle{ margin:0; color: var(--p-text-muted-color); }

    /* Chip + Toggle mejorado */
    .switch{
      display:flex; align-items:center; gap:.5rem;
      padding:.25rem .6rem;
      background: color-mix(in oklab, var(--p-surface-100) 65%, var(--p-surface-0));
      border:1px solid var(--p-surface-200);
      border-radius: 999px;
      white-space: nowrap;
    }
    .lbl{
      color: var(--p-text-color);
      font-weight:700;
      letter-spacing:.2px;
    }

    /* Estilo interno del ToggleSwitch (PrimeNG) */
    :host ::ng-deep .switch .p-toggleswitch{
      width: 46px; height: 26px; position: relative;
    }
    :host ::ng-deep .switch .p-toggleswitch-slider{
      width:100%; height:100%;
      border-radius: 999px;
      background: var(--p-surface-300);
      transition: background .18s ease;
    }
    :host ::ng-deep .switch .p-toggleswitch-handle{
      position:absolute; top:2px; left:2px;
      width:22px; height:22px; border-radius:50%;
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

    .btn-row{ display:flex; gap:.5rem; align-items:center; margin-top:.25rem; }

    @media (max-width:768px){
      .subline{ flex-direction:column; align-items:flex-start; gap:.25rem; }
      .switch{ align-self:flex-start; }
      .btn-row{ flex-wrap:wrap; }
    }
  `]
})
export class CategoriesHeaderComponent {
  @Input() title = 'Categorías';
  @Input() subtitle = 'Listado de categorías registradas.';

  
  @Input() active = true;
  @Output() activeChange = new EventEmitter<boolean>();

  @Output() addClick = new EventEmitter<void>();
  @Output() orderClick = new EventEmitter<void>();
}
