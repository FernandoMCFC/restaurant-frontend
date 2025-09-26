import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiStore } from '../ui.store';
import { APP_MENU_GROUPS } from '../../navigation/menu.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Backdrop móvil -->
    <div class="backdrop" *ngIf="isMobile() && isDrawerOpen()" (click)="close()"></div>

    <aside class="sidebar"
           [class.collapsed]="isCollapsed() && !isMobile()"
           [class.open]="isMobile() && isDrawerOpen()">

      <div class="sidebar-inner">
        <!-- Scroll propio del menú -->
        <div class="menu-scroll">
          <ng-container *ngFor="let group of groups">
            <div class="section-title" [class.compact]="isCollapsed() && !isMobile()">
              <span class="text" *ngIf="!isCollapsed() || isMobile()">{{ group.label }}</span>
              <span class="bar" *ngIf="isCollapsed() && !isMobile()"></span>
            </div>

            <nav class="menu">
              <a *ngFor="let item of group.items"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{exact:true}"
                 class="menu-item"
                 (click)="onNavigate()">
                <i class="{{item.icon}}"></i>
                <span class="label" *ngIf="!isCollapsed() || isMobile()">{{ item.label }}</span>
              </a>
            </nav>
          </ng-container>
        </div>

        <!-- Eliminado el botón pequeño de colapsar -->
      </div>
    </aside>
  `,
  styles: [`
    :host { display:block; }

    .backdrop {
      position: fixed; inset: 0;
      background: color-mix(in oklab, var(--p-surface-900) 40%, transparent);
      z-index: 998;
    }

    /* Card blanca con gutter (desktop) */
    .sidebar {
      position: fixed;
      top: calc(var(--app-topbar-h, 64px) + 16px);
      left: 16px;
      height: calc(100vh - var(--app-topbar-h, 64px) - 32px);
      width: 280px;
      background: var(--p-surface-0);
      border: 1px solid var(--p-content-border-color, var(--p-surface-200));
      border-radius: 12px;
      box-shadow: var(--p-shadow-1);
      transition: width .2s ease, transform .2s ease;
      z-index: 999;
      display: flex;
      flex-direction: column;
    }
    .sidebar.collapsed { width: 72px; }

    @media (max-width: 991px) {
      .sidebar {
        top: var(--app-topbar-h, 64px);
        left: 0;
        height: calc(100vh - var(--app-topbar-h, 64px));
        border-radius: 0;
        box-shadow: var(--p-shadow-2);
        transform: translateX(-100%);
      }
      .sidebar.open { transform: translateX(0); }
    }

    .sidebar-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: .75rem .5rem;
      gap: .5rem;
    }

    /* Scroll interno del menú (solo aquí) */
    .menu-scroll {
      overflow: auto;
      flex: 1 1 auto;
      padding-right: .25rem; 
    }

    .section-title {
      display: flex;
      align-items: center;
      height: 32px;
      margin: .25rem .5rem .25rem .5rem;
      color: var(--p-text-muted-color);
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .4px;
    }
    .section-title.compact {
      justify-content: center;
    }
    .section-title .bar {
      width: 24px; height: 2px; border-radius: 2px;
      background: var(--p-surface-300);
    }

    .menu { display: flex; flex-direction: column; gap: .25rem; }

    .menu-item {
      display: flex; align-items: center; gap: .75rem;
      padding: .625rem .75rem;
      margin: 0 .25rem;
      border-radius: .75rem;
      color: var(--p-text-color);
      text-decoration: none;
    }
    .menu-item:hover { background: var(--p-surface-100); }
    .menu-item.active { background: var(--p-primary-50); color: var(--p-primary-color); }
    .menu-item i { font-size: 1.1rem; width: 1.25rem; text-align: center; }
    .label { white-space: nowrap; }
  `]
})
export class SidebarComponent {
  private store = inject(UiStore);

  groups = APP_MENU_GROUPS;
  isMobile = computed(() => this.store.isMobile());
  isCollapsed = computed(() => this.store.isSidebarCollapsed());
  isDrawerOpen = computed(() => this.store.isMobileDrawerOpen());

  close() { this.store.closeDrawer(); }
  onNavigate() { if (this.isMobile()) this.close(); }
}
