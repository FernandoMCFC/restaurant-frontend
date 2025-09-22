import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SessionService } from '../../../../core/auth/services/session.service';
import { SessionState } from '../../../../core/auth/state/session.state';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-tenant-select',
  imports: [CommonModule, ButtonModule],
  template: `
  <h1 style="font-size:28px;margin:0 0 12px;">Selecciona empresa</h1>
  <div style="display:grid;gap:10px;max-width:420px">
    <button pButton *ngFor="let t of tenants()" (click)="pick(t.id)" [label]="t.name"></button>
  </div>
  `
})
export class TenantSelectPage {
  tenants = computed(() => this.state.snapshot().tenants);
  constructor(private state: SessionState, private session: SessionService, private router: Router) {}
  pick(id: string){ this.session.selectTenant(id); this.router.navigateByUrl('/app'); }
}
