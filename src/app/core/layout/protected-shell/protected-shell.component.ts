import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/* PrimeNG 20 - standalone components/directives */
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Ripple } from 'primeng/ripple';

@Component({
  standalone: true,
  selector: 'app-protected-shell',
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    Button, Avatar, Ripple
  ],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">

      <!-- SIDEBAR -->
      <aside class="sidebar"
             [class.expanded]="!sidebarCollapsed() && !isMobile()"
             [class.collapsed]="sidebarCollapsed() && !isMobile()"
             [class.overlay-open]="isMobile() && sidebarOverlayOpen()">

        <div class="sidebar-header">
          <p-button class="only-mobile" icon="pi pi-times" [text]="true" (onClick)="toggleOverlay()"></p-button>
          <div class="brand">
            <img src="/branding/company-logo.svg" alt="logo" />
            <span class="brand-text" *ngIf="!sidebarCollapsed() || isMobile()">Web App</span>
          </div>
        </div>

        <div class="menu-scroll">
          <nav class="menu" aria-label="Navegación principal">
            <span class="menu-title" *ngIf="!sidebarCollapsed() || isMobile()">Home</span>
            <a routerLink="/app/dashboard" routerLinkActive="active" (click)="closeOnMobile()">
              <i class="pi pi-home"></i>
              <span *ngIf="!sidebarCollapsed() || isMobile()">Dashboard</span>
            </a>

            <span class="menu-title" *ngIf="!sidebarCollapsed() || isMobile()">Restaurant</span>
            <a routerLink="/app/settings/restaurant" routerLinkActive="active" (click)="closeOnMobile()">
              <i class="pi pi-cog"></i>
              <span *ngIf="!sidebarCollapsed() || isMobile()">Configuracion</span>
            </a>
          </nav>
        </div>
      </aside>

      <!-- OVERLAY móvil -->
      <div class="overlay" *ngIf="isMobile() && sidebarOverlayOpen()" (click)="toggleOverlay()" aria-hidden="true"></div>

      <!-- MAIN -->
      <div class="main">
        <!-- TOPBAR -->
        <header class="topbar">
          <div class="left">
            <!-- Desktop: colapsa/expande; Móvil: abre/cierra drawer -->
            <p-button
              [icon]="isMobile() ? 'pi pi-bars' : (sidebarCollapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left')"
              [text]="true"
              (onClick)="onHamburger()"
              pRipple
            ></p-button>
            <h1 class="title">Web App Restaurant</h1>
          </div>
          <div class="right">
            <!-- <p-button icon="pi pi-sun" [text]="true" pRipple></p-button> -->
            <!-- <p-button icon="pi pi-bell" [text]="true" pRipple></p-button> -->
            <p-avatar label="R" shape="circle"></p-avatar>
          </div>
        </header>

        <!-- CONTENT -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block}
    .layout{
      min-height:100dvh;
      display:flex;
      background: var(--p-surface-50);
      color: var(--p-text-color);
    }

    /* ===== SIDEBAR ===== */
    .sidebar{
      background: var(--p-surface-0);
      border-right:1px solid var(--p-surface-300);
      display:flex; flex-direction:column;
      position:sticky; top:0; height:100dvh; align-self:flex-start;
      width:280px; transition: width .2s ease, transform .25s ease;
    }
    .sidebar.collapsed{ width:80px; }
    .sidebar.expanded{ width:280px; }

    .sidebar-header{
      display:flex; align-items:center; gap:.5rem;
      padding:.75rem 1rem; border-bottom:1px solid var(--p-surface-300);
    }
    .only-mobile{ display:none; }
    .brand{ display:flex; align-items:center; gap:.5rem; font-weight:700; }
    .brand img{ height:26px; }
    .brand-text{ white-space:nowrap; }

    .menu-scroll{ overflow:auto; flex:1; }
    .menu{ display:flex; flex-direction:column; gap:.25rem; padding:1rem .75rem; }
    .menu-title{
      font-size:.75rem; text-transform:uppercase; letter-spacing:.06em;
      color: var(--p-text-muted-color); margin:.5rem .25rem;
    }
    .menu a{
      display:flex; align-items:center; gap:.75rem;
      padding:.6rem .75rem; border-radius:.5rem;
      color: var(--p-text-color); text-decoration:none;
      transition: background .2s ease;
    }
    .menu a:hover{ background: var(--p-surface-200); }
    .menu a.active{ background: var(--p-primary-100); color: var(--p-primary-color); }
    .menu i{ width:1.25rem; text-align:center; }

    /* ===== MAIN + TOPBAR ===== */
    .main{ flex:1; display:flex; flex-direction:column; min-width:0; }
    .topbar{
      position:sticky; top:0; z-index:5;
      display:flex; align-items:center; justify-content:space-between;
      padding:.5rem 1rem; background: var(--p-surface-0);
      border-bottom:1px solid var(--p-surface-300);
    }
    .topbar .left{ display:flex; align-items:center; gap:.5rem; }
    .title{ margin:0; font-size:1.05rem; font-weight:700; }
    .content{ padding:1rem; }

    /* ===== RESPONSIVE (drawer en móvil) ===== */
    @media (max-width: 991px){
      .sidebar{
        position:fixed; inset:0 auto 0 0;
        transform: translateX(-100%);
        z-index:1001; box-shadow:0 10px 30px rgba(0,0,0,.2);
      }
      .sidebar.overlay-open{ transform: translateX(0); }
      .overlay{
        position:fixed; inset:0; background:rgba(0,0,0,.35);
        backdrop-filter: blur(1px); z-index:1000;
      }
      .only-mobile{ display:inline-flex; }
    }
  `]
})
export class ProtectedShellComponent {
  isMobile = signal<boolean>(window.innerWidth <= 991);
  sidebarCollapsed = signal<boolean>(false);       // desktop: colapsado o no
  sidebarOverlayOpen = signal<boolean>(false);     // móvil: drawer

  // Botón hamburguesa
  onHamburger(){
    if (this.isMobile()) this.toggleOverlay();
    else this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleOverlay(){
    this.sidebarOverlayOpen.set(!this.sidebarOverlayOpen());
    document.body.classList.toggle('no-scroll', this.sidebarOverlayOpen());
  }

  closeOnMobile(){
    if (this.isMobile() && this.sidebarOverlayOpen()){
      this.sidebarOverlayOpen.set(false);
      document.body.classList.remove('no-scroll');
    }
  }

  @HostListener('window:resize')
  onResize(){
    const mobile = window.innerWidth <= 991;
    if (mobile !== this.isMobile()){
      this.isMobile.set(mobile);
      // al cambiar de modo, cerrar overlay y resetear scroll lock
      this.sidebarOverlayOpen.set(false);
      document.body.classList.remove('no-scroll');
    }
  }
}
