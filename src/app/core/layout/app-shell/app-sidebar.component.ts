import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-sidebar surface-card">
      <div class="layout-sidebar-content">
        <!-- HOME -->
        <div class="menu-section">HOME</div>
        <a routerLink="/app/dashboard" routerLinkActive="active" class="menu-link">
          <i class="pi pi-home"></i><span>Dashboard</span>
        </a>

        <!-- RESTAURANT -->
        <div class="menu-section mt-3">RESTAURANT</div>
        <a routerLink="/app/settings" routerLinkActive="active" class="menu-link">
          <i class="pi pi-cog"></i><span>Configuración</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .layout-sidebar{
      width:280px; height:100%; overflow:hidden;
      border:1px solid var(--surface-border);
      border-radius:1rem;
      box-shadow:0 1px 2px color-mix(in srgb, var(--surface-900) 6%, transparent);
    }
    .layout-sidebar-content{ height:100%; overflow:auto; padding:.75rem; }

    .menu-section{
      font-size:.75rem; font-weight:700; letter-spacing:.08em;
      color:var(--text-color-secondary); padding:.25rem .25rem .25rem .5rem;
    }
    .menu-link{
      display:flex; align-items:center; gap:.5rem;
      padding:.6rem .6rem .6rem .5rem; border-radius:.6rem;
      text-decoration:none; color:inherit; transition:background .15s ease;
    }
    .menu-link i{
      width:28px; height:28px; display:grid; place-items:center;
      border-radius:.6rem; border:1px solid var(--surface-border);
      background:var(--surface-100); color:var(--primary-color);
    }
    .menu-link:hover, .menu-link.active{
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    }
    .menu-link.active i{
      background: color-mix(in srgb, var(--primary-color) 18%, var(--surface-card));
      border-color: color-mix(in srgb, var(--primary-color) 30%, var(--surface-border));
    }
    .mt-3{ margin-top:1rem; }
  `]
})
export class AppSidebarComponent {}
