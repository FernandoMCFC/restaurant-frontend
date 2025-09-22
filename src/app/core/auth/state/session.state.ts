
// el estado se poblará con la API

import { Injectable, signal, computed } from '@angular/core';

export interface TenantRef { id: string; name: string; }
export interface SessionSnapshot {
  isAuthenticated: boolean;
  tenants: TenantRef[];
  currentTenantId?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionState {
  private _s = signal<SessionSnapshot>({
    isAuthenticated: false,
    tenants: []
  });

  readonly snapshot = this._s.asReadonly();
  readonly isAuthenticated = computed(() => this._s().isAuthenticated);
  readonly currentTenantId = computed(() => this._s().currentTenantId);

  setAuthenticated(v: boolean) {
    this._s.update(s => ({ ...s, isAuthenticated: v }));
  }
  setTenants(t: TenantRef[]) {
    this._s.update(s => ({ ...s, tenants: t }));
  }
  setCurrentTenant(id?: string) {
    this._s.update(s => ({ ...s, currentTenantId: id }));
  }
  reset() {
    this._s.set({ isAuthenticated: false, tenants: [] });
  }
}
