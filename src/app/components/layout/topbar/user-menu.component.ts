import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuModule, Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { SessionService } from '../../../core/auth/services/session.service';

@Component({
  standalone: true,
  selector: 'app-user-menu',
  imports: [CommonModule, MenuModule, AvatarModule, RippleModule],
  styles: [`
    :host { display: block; }

    .user-btn {
      display: grid; 
      place-items: center;
      width: 38px; 
      height: 38px;
      border-radius: 999px;
      border: 1px solid var(--p-surface-200);
      background: transparent;
      color: var(--p-text-color);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .user-btn:hover {
      background: color-mix(in oklab, var(--p-primary-color) 12%, transparent);
      border-color: var(--p-primary-color);
    }

    /* QUITAMOS el appendTo="body" y usamos estilos normales */
    .user-menu-panel {
      border-radius: 8px;
      border: 1px solid var(--p-surface-200);
      box-shadow: 0 10px 25px rgba(0,0,0,0.12);
      padding: 0;
      min-width: 240px;
      background: var(--p-surface-0);
    }

    .menu-header {
      padding: 16px 16px 12px 16px;
      background: var(--p-surface-0);
      border-bottom: 1px solid var(--p-surface-100);
      margin: 0;
    }
    .menu-subtitle {
      font-size: 12px;
      color: var(--p-text-color-secondary);
      display: block;
      margin-bottom: 4px;
      font-weight: 400;
    }
    .menu-email {
      font-weight: 600;
      color: var(--p-text-color);
      font-size: 14px;
      line-height: 1.3;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 0;
      font-weight: 500;
      color: var(--p-text-color);
      background: transparent;
      border: none;
      text-decoration: none;
      cursor: pointer;
      width: 100%;
      font-family: inherit;
      font-size: 14px;
    }
    .menu-item:hover {
      background: var(--p-surface-50);
    }
    .menu-item:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .menu-icon {
      color: var(--p-text-color-secondary);
      font-size: 16px;
      width: 16px;
      text-align: center;
    }
  `],
  template: `
    <button type="button"
            class="user-btn"
            pRipple
            (click)="menu.toggle($event)"
            aria-haspopup="menu"
            aria-label="Menú de usuario">
      <p-avatar icon="pi pi-user" shape="circle"></p-avatar>
    </button>

    <!-- QUITAMOS [appendTo]="'body'" para que el menú se renderice dentro del componente -->
    <p-menu #menu [model]="items" [popup]="true" styleClass="user-menu-panel">
      <ng-template pTemplate="start">
        <div class="menu-header">
          <span class="menu-subtitle">Sesión iniciada como</span>
          <div class="menu-email">{{ email() || 'usuario@dominio.com' }}</div>
        </div>
      </ng-template>
      
      <!-- Template personalizado para los items -->
      <ng-template pTemplate="item" let-item>
        <button class="menu-item" (click)="item.command?.()">
          <i class="menu-icon" [class]="item.icon"></i>
          <span>{{ item.label }}</span>
        </button>
      </ng-template>
    </p-menu>
  `
})
export class UserMenuComponent {
  @ViewChild('menu') menu!: Menu;
  private router = inject(Router);
  private session = inject(SessionService);
  email = signal<string>(this.resolveUserEmail());

  items: MenuItem[] = [
    { label: 'Perfil', icon: 'pi pi-user', command: () => this.goProfile() },
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  private goProfile() { this.router.navigateByUrl('/profile'); }
  private logout() {
    try { (this.session as any)?.logout?.(); } catch {}
    try { localStorage.removeItem('token'); } catch {}
    this.router.navigateByUrl('/sign-in');
  }

  private resolveUserEmail(): string {
    const s = this.session as any;
    const fromSignal = typeof s?.currentUser === 'function' ? s.currentUser()?.email : s?.currentUser?.email;
    if (fromSignal) return String(fromSignal);
    const fromGetter = s?.getUser?.() || s?.getCurrentUser?.();
    if (fromGetter?.email) return String(fromGetter.email);
    if (s?.user$?.value?.email) return String(s.user$.value.email);
    try { const raw = localStorage.getItem('currentUser'); if (raw) { const p = JSON.parse(raw); if (p?.email) return String(p.email); } } catch {}
    try { const e = localStorage.getItem('email'); if (e) return e; } catch {}
    return '';
  }
}