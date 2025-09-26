import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../services/layout.service';
import { AppTopbarComponent } from './app-topbar.component';
import { AppSidebarComponent } from './app-sidebar.component';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterOutlet, AppTopbarComponent, AppSidebarComponent],
  template: `
    <div class="layout-wrapper" [class.layout-sidebar-active]="sidebarActive()">
      <!-- Topbar fijo -->
      <app-topbar (menuToggle)="onMenuToggle()"></app-topbar>

      <!-- Contenedor: Sidebar + Contenido -->
      <div class="layout-container">
        <app-sidebar></app-sidebar>

        <div class="layout-main-container">
          <div class="layout-main">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>

      <!-- Overlay móvil -->
      <div class="layout-mask" (click)="onMaskClick()"></div>
    </div>
  `,
  styles: [`
    .layout-wrapper{ min-height:100dvh; background:var(--surface-ground); color:var(--text-color); }

    /* Grid principal con padding exterior, como Sakai */
    .layout-container{
      display:grid; grid-template-columns:1fr; gap:1rem; padding:1.25rem;
    }

    /* Contenido centrado con ancho máximo */
    .layout-main-container{ min-height:calc(100dvh - 64px); }
    .layout-main{ max-width:1160px; margin:0 auto; display:grid; gap:1rem; }

    /* Sidebar por defecto oculto; visible en desktop por media query */
    .layout-sidebar{ display:none; }

    @media (min-width:992px){
      .layout-container{ grid-template-columns:280px 1fr; padding:1.5rem; }
      .layout-sidebar{ display:block; }
    }

    /* Sidebar móvil activado por clase en el wrapper */
    .layout-wrapper.layout-sidebar-active .layout-sidebar{
      display:block; position:fixed; top:64px; left:0; z-index:110; height:calc(100dvh - 64px);
    }
    .layout-mask{
      display:none; position:fixed; inset:0; z-index:100;
      background: color-mix(in srgb, var(--surface-900) 30%, transparent);
    }
    .layout-wrapper.layout-sidebar-active .layout-mask{ display:block; }
  `]
})
export class AppShellComponent {
  sidebarActive = computed(() => this.layout.sidebarActive());
  constructor(private layout: LayoutService) {}
  onMenuToggle(){ this.layout.toggleSidebar(); }
  onMaskClick(){ this.layout.hideSidebar(); }
}
