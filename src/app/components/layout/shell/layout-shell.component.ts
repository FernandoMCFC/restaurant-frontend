import { Component, HostListener, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContentComponent } from '../content/content.component';
import { FooterComponent } from '../footer/footer.component';
import { UiStore } from '../ui.store';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [CommonModule, TopbarComponent, SidebarComponent, ContentComponent, FooterComponent],
  template: `
    <div class="shell" [class.sidebar-collapsed]="isCollapsed()" [class.mobile]="isMobile()">
      <app-topbar></app-topbar>
      <app-sidebar></app-sidebar>
      <div class="shell-body">
        <app-content></app-content>
        <app-footer></app-footer>
      </div>
    </div>
  `,
    
    styles: [`
      :host { display:block; }

      /* Fondo general gris (como Sakai) y sin scroll en el wrapper */
      .shell {
        height: 100vh;
        overflow: hidden;
        background: var(--p-surface-100);
      }

      /* El cuerpo (zona derecha) es quien scrollea */
      .shell-body {
        height: calc(100vh - 64px);          /* 64px = altura del topbar */
        overflow: auto;                       /* scroll solo aquí */
        /* ANTES: padding: 16px 16px 16px calc(280px + 32px) */
        /* Ahora: sin padding horizontal derecho (full-width), conservando separación con sidebar a la izq */
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: calc(280px + 32px);
        padding-right: 0;                     /* ← sin margen lateral derecho */
        transition: padding-left .2s ease;
        will-change: padding-left;
        background: transparent;
      }

      .shell.sidebar-collapsed .shell-body {
        /* ANTES: padding-left: calc(72px + 32px) */
        padding-left: calc(72px + 32px);      /* mantenemos la misma separación cuando la barra está colapsada */
      }

      @media (max-width: 991px) {
        .shell-body {
          /* ANTES: padding: 16px;  → eso metía margen a izquierda y derecha en móvil */
          /* Ahora: pegado al borde en móvil (0 horizontal), dejando respiración solo vertical */
          padding-top: 16px;
          padding-bottom: 16px;
          padding-left: 0;    /* ← sin margen lateral izq en móvil */
          padding-right: 0;   /* ← sin margen lateral der en móvil */
        }
      }
    `]



})
export class LayoutShellComponent implements OnInit {
  private store = inject(UiStore);

  isCollapsed = computed(() => this.store.isSidebarCollapsed());
  isMobile = computed(() => this.store.isMobile());

  ngOnInit(): void {
    this.store.updateIsMobile(typeof window !== 'undefined' ? window.innerWidth : 1200);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const width = (event.target as Window).innerWidth;
    this.store.updateIsMobile(width);
  }
}
