import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [CommonModule, ButtonModule, BadgeModule, RouterLink],
  template: `
    <div class="layout-topbar surface-card">
      <button
        pButton
        type="button"
        icon="pi pi-bars"
        class="layout-menu-button p-button-text p-button-rounded"
        (click)="menuToggle.emit()"
        aria-label="Open menu">
      </button>

      <a class="layout-topbar-logo" [routerLink]="['/app/dashboard']" aria-label="Dashboard">
        <img src="/assets/branding/company-logo.svg" alt="Logo" />
        <span>SAKAI</span>
      </a>

      <div class="layout-topbar-actions">
        <button pButton type="button" icon="pi pi-sun" aria-label="Theme"></button>
        <button pButton type="button" icon="pi pi-globe" aria-label="Language"></button>
        <button pButton type="button" icon="pi pi-calendar" aria-label="Calendar"></button>
        <button pButton type="button" icon="pi pi-bell" pBadge severity="danger" aria-label="Notifications"></button>
        <button pButton type="button" icon="pi pi-user" aria-label="User"></button>
      </div>
    </div>
  `,
  styles: [`
    .layout-topbar{
      position:sticky; top:0; z-index:100;
      display:flex; align-items:center; justify-content:space-between;
      padding:.75rem 1rem; border-bottom:1px solid var(--surface-border);
      box-shadow:0 1px 2px color-mix(in srgb, var(--surface-900) 8%, transparent);
    }
    .layout-menu-button{ margin-right:.5rem; }
    .layout-topbar-logo{
      display:flex; align-items:center; gap:.5rem; text-decoration:none; color:inherit;
    }
    .layout-topbar-logo img{ width:28px; height:28px; object-fit:contain; }
    .layout-topbar-logo span{ font-weight:700; letter-spacing:.3px; }
    .layout-topbar-actions{ display:flex; align-items:center; gap:.5rem; }
    /* Botones morados cuadrados al estilo Sakai */
    .layout-topbar-actions :where(.p-button){
      width:40px; height:40px; border-radius:.75rem;
      background: var(--primary-color); color: var(--primary-contrast-color); border:0;
    }
    .layout-topbar-actions :where(.p-button:hover){ filter:brightness(1.06); }
  `]
})
export class AppTopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
}
