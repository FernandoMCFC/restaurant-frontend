import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStore } from '../ui.store';
import { UserMenuComponent } from './user-menu.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule,UserMenuComponent],
  template: `
    <header class="topbar">
      <div class="left">
        <button class="icon-btn" type="button" (click)="onMenu()">
          <i class="pi pi-bars"></i>
        </button>

        <img
          src="/branding/company-logo.svg"
          alt="Web App Restaurant"
          class="logo"
          draggable="false"
        />
        <span class="app-title">Web App Restaurant</span>
      </div>

      <div class="right">
        <!-- <button class="icon-btn" type="button" aria-label="Perfil">
          <i class="pi pi-user"></i>
        </button> -->
        <app-user-menu></app-user-menu>
        
      </div>
    </header>
  `,
  styles: [`
    :host { display:block; }

    .topbar {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 .75rem;
      background: var(--p-surface-0);              /* fondo blanco */
      border-bottom: 1px solid var(--p-surface-200);/* separación gris */
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .left, .right { display: flex; align-items: center; gap: .5rem; }

    .icon-btn {
      display: grid; place-items: center;
      width: 38px; height: 38px;
      border: 0; border-radius: 999px;
      background: transparent;
      color: var(--p-text-color);
      cursor: pointer;
      transition: background-color .15s ease;
    }
    .icon-btn:hover { background: var(--p-surface-100); }
    .icon-btn:active { background: var(--p-surface-200); }

    .pi { font-size: 1.1rem; }

    .logo {
      height: 26px;
      user-select: none;
      -webkit-user-drag: none;
      margin-left: .25rem;
    }

    .app-title {
      font-weight: 600;
      letter-spacing: .2px;
    }
  `]
})
export class TopbarComponent {
  private store = inject(UiStore);
  isMobile = computed(() => this.store.isMobile());

  onMenu() {
    this.store.toggleSidebar();
  }
}
