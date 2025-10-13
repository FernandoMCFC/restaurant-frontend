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

    /* Fondo general y sin scroll global */
    .shell {
      height: 100dvh;            /* mejor manejo en móviles que 100vh */
      overflow: hidden;          /* bloquea scroll del wrapper */
      background: var(--p-surface-100);
    }

    /* Cuerpo: ya NO scrollea (scroll vivirá en cada página interna) */
    .shell-body {
      height: calc(100dvh - 64px);  /* 64px = altura del topbar */
      overflow: hidden;             /* ← antes era auto: aquí apagamos el scroll general */
      padding-top: 16px;
      padding-bottom: 16px;
      padding-left: calc(280px + 32px);
      padding-right: 0;
      transition: padding-left .2s ease;
      will-change: padding-left;
      background: transparent;
    }

    .shell.sidebar-collapsed .shell-body {
      padding-left: calc(72px + 32px);
    }

    @media (max-width: 991px) {
      .shell-body {
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 0;
        padding-right: 0;
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
