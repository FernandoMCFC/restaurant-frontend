import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../auth/services/session.service';

@Component({
  standalone: true,
  selector: 'app-protected-shell',
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
  <header style="display:flex;align-items:center;gap:16px;padding:12px 16px;border-bottom:1px solid #e5e7eb;background:#fff">
    <img src="/branding/company-logo.svg" alt="Logo" style="height:28px"/>
    <strong>Restaurant Platform</strong>
    <span style="margin-left:auto"></span>
    <a routerLink="/sign-in" (click)="logout()" class="p-link">Cerrar sesión</a>
  </header>
  <main style="padding:16px">
    <router-outlet />
  </main>
  `
})
export class ProtectedShellComponent {
  constructor(private session: SessionService) {}
  logout(){ this.session.signOut(); }
}
