// src/app/components/menus/menus-header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG v20 */
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-menus-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  template: `
    <header class="menus-head">
      <div class="left">
        <h2 class="title">{{ title }}</h2>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>

      <div class="right">
        <button
          pButton
          pRipple
          type="button"
          icon="pi pi-plus"
          label="Agregar menú"
          (click)="addClick.emit()"
        ></button>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 1rem 1.5rem 0.75rem;
        border-bottom: 1px solid var(--surface-border);
        background-color: var(--surface-card);
      }

      .menus-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .left {
        flex: 1 1 auto;
        min-width: 0;
      }

      .title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .subtitle {
        margin: 0.25rem 0 0;
        color: var(--text-color-secondary);
        font-size: 0.9rem;
      }

      .right {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      @media (max-width: 768px) {
        :host {
          padding: 0.75rem 1rem 0.5rem;
        }

        .menus-head {
          flex-direction: column;
          align-items: stretch;
        }

        .right {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class MenusHeaderComponent {
  @Input() title = 'Menús';
  @Input() subtitle = 'Crea y administra tus menús.';

  @Output() addClick = new EventEmitter<void>();
}
