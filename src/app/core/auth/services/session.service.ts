// flujo de acceso (solo 
// "iniciar/cerrar sesión" y "elegir empresa"; luego llamará APIs reales.

import { Injectable } from '@angular/core';
import { SessionState, TenantRef } from '../state/session.state';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private s: SessionState) {}

   
  signIn(_email: string, _password: string) {
    this.s.setAuthenticated(true);
    
    if (!this.s.snapshot().tenants.length) {
      const demo: TenantRef[] = [{ id: 't-001', name: 'Restaurante Demo' }];
      this.s.setTenants(demo);
      this.s.setCurrentTenant(demo[0].id);
    }
  }
  signOut() {
    this.s.reset();
  }
  selectTenant(id: string) {
    this.s.setCurrentTenant(id);
  }
}
