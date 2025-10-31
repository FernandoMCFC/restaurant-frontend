// src/app/components/layout/sidebar/sidebar.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiStore } from '../ui.store';
import { APP_MENU_GROUPS } from '../../navigation/menu.model';

type MenuItem = { label: string; icon: string; route?: string; children?: MenuItem[] };
type MenuGroup = { label: string; items: MenuItem[] };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="backdrop" *ngIf="isMobile() && isDrawerOpen()" (click)="close()"></div>

    <aside class="sidebar" [class.collapsed]="isCollapsed() && !isMobile()" [class.open]="isMobile() && isDrawerOpen()">
      <div class="sidebar-inner">
        <div class="menu-scroll">
          <ng-container *ngFor="let g of groups">
            <div class="section-title" [class.compact]="isCollapsed() && !isMobile()">
              <span *ngIf="!isCollapsed() || isMobile()">{{ g.label }}</span>
              <span class="bar" *ngIf="isCollapsed() && !isMobile()"></span>
            </div>

            <nav class="menu">
              <ng-container *ngFor="let it of g.items">
                <ng-container *ngIf="hasChildren(it); else simple">
                  <button type="button" class="menu-item menu-button" (click)="toggle(it)">
                    <i class="{{ it.icon }}"></i>
                    <span class="label" *ngIf="!isCollapsed() || isMobile()">{{ it.label }}</span>
                    <i *ngIf="!isCollapsed() || isMobile()" class="pi chevron" [ngClass]="expanded(it) ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                  </button>

                  <ul class="submenu" *ngIf="(!isCollapsed() || isMobile()) && expanded(it)">
                    <li *ngFor="let ch of it.children">
                      <a class="submenu-item"
                         [routerLink]="ch.route"
                         routerLinkActive="active"
                         [routerLinkActiveOptions]="{ exact: true }"
                         (click)="onNavigate()">
                        <i class="{{ ch.icon }}"></i>
                        <span class="label">{{ ch.label }}</span>
                      </a>
                    </li>
                  </ul>
                </ng-container>

                <ng-template #simple>
                  <a class="menu-item"
                     *ngIf="it.route"
                     [routerLink]="it.route"
                     routerLinkActive="active"
                     [routerLinkActiveOptions]="{ exact: true }"
                     (click)="onNavigate()">
                    <i class="{{ it.icon }}"></i>
                    <span class="label" *ngIf="!isCollapsed() || isMobile()">{{ it.label }}</span>
                  </a>
                </ng-template>
              </ng-container>
            </nav>
          </ng-container>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host{ display:block }

    .backdrop{
      position:fixed; inset:0;
      background: color-mix(in oklab, var(--p-surface-900) 40%, transparent);
      z-index: 998;
    }

    /* Margen (gutter) configurable alrededor del sidebar */
    .sidebar{
      --sidebar-gap: 16px; /* ⇦ ajusta el margen superior/lateral */
      position: fixed;
      top: calc(var(--app-topbar-h, 64px) + var(--sidebar-gap));
      left: var(--sidebar-gap);
      height: calc(100vh - var(--app-topbar-h, 64px) - (var(--sidebar-gap) * 2));
      width: 280px;
      background: var(--p-surface-0);
      border: 1px solid var(--p-content-border-color, var(--p-surface-200));
      border-radius: 12px;
      box-shadow: var(--p-shadow-1);
      transition: width .2s ease, transform .2s ease, top .2s ease, left .2s ease, height .2s ease;
      z-index: 999;
      display: flex;
      flex-direction: column;
    }
    .sidebar.collapsed{ width:72px }

    @media (max-width: 991px){
      .sidebar{
        /* En móvil sin gutter lateral; si quieres margen arriba, cambia a 8px */
        --sidebar-gap: 0px;
        top: calc(var(--app-topbar-h, 64px) + 0px);
        left: 0;
        height: calc(100vh - var(--app-topbar-h, 64px) - 0px);
        border-radius: 0;
        box-shadow: var(--p-shadow-2);
        transform: translateX(-100%);
      }
      .sidebar.open{ transform: translateX(0) }
    }

    .sidebar-inner{
      display:flex; flex-direction:column; height:100%;
      padding:.75rem .5rem; gap:.5rem;
    }

    .menu-scroll{ overflow:auto; flex:1 1 auto; padding-right:.25rem }

    .section-title{
      display:flex; align-items:center; height:32px;
      margin:.25rem .5rem; color:var(--p-text-muted-color);
      font-size:.75rem; font-weight:600; letter-spacing:.4px;
    }
    .section-title.compact{ justify-content:center }
    .section-title .bar{ width:24px; height:2px; border-radius:2px; background:var(--p-surface-300) }

    .menu{ display:flex; flex-direction:column; gap:.25rem }

    .menu-item{
      display:flex; align-items:center; gap:.75rem;
      padding:.625rem .75rem; margin:0 .25rem; border-radius:.75rem;
      color:var(--p-text-color); text-decoration:none;
    }
    .menu-item:hover{ background:var(--p-surface-100) }
    .menu-item.active{ background:var(--p-primary-50); color:var(--p-primary-color) }
    .menu-item i{ font-size:1.1rem; width:1.25rem; text-align:center }
    .label{ white-space:nowrap }

    .menu-button{
      width:calc(100% - .5rem); margin:0 .25rem;
      background:transparent; border:0; text-align:left; cursor:pointer;
    }
    .menu-button .chevron{ margin-left:auto; color:var(--p-text-muted-color) }

    .submenu{
      margin:.25rem .25rem .5rem 1.75rem; padding-left:.5rem;
      border-left:1px solid var(--p-surface-300);
      display:flex; flex-direction:column; gap:.25rem;
    }
    .submenu-item{
      display:flex; align-items:center; gap:.5rem;
      padding:.5rem .625rem; border-radius:.5rem;
      color:var(--p-text-color); text-decoration:none;
    }
    .submenu-item:hover{ background:var(--p-surface-100) }
    .submenu-item.active{ background:var(--p-primary-50); color:var(--p-primary-color) }
    .submenu-item i{ font-size:1rem; width:1.25rem; text-align:center }
  `]
})
export class SidebarComponent {
  private store = inject(UiStore);

  groups: MenuGroup[] = APP_MENU_GROUPS as MenuGroup[];
  isMobile = computed(() => this.store.isMobile());
  isCollapsed = computed(() => this.store.isSidebarCollapsed());
  isDrawerOpen = computed(() => this.store.isMobileDrawerOpen());

  private expandedSet = signal<Set<string>>(new Set());

  close(){ this.store.closeDrawer(); }
  onNavigate(){ if (this.isMobile()) this.close(); }

  hasChildren = (it: MenuItem) => Array.isArray(it.children) && it.children.length > 0;

  toggle(it: MenuItem){
    const s = new Set(this.expandedSet());
    const k = this.key(it);
    s.has(k) ? s.delete(k) : s.add(k);
    this.expandedSet.set(s);
  }

  expanded(it: MenuItem){ return this.expandedSet().has(this.key(it)); }

  private key(it: { label: string; route?: string }){ return `${it.label}::${it.route ?? ''}`; }
}
