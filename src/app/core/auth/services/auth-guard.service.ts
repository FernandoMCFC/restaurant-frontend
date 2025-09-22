// arrera de acceso a zonas protegidas
// redirige a Sign in 
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionState } from '../state/session.state';

export const authGuard: CanActivateFn = () => {
  const state = inject(SessionState);
  const router = inject(Router);

  if (!state.isAuthenticated()) {
    router.navigateByUrl('/sign-in');
    return false;
  }
  // si exiges tenant seleccionado para entrar a /app
  // if (!state.currentTenantId()) { router.navigateByUrl('/tenant-select'); return false; }
  return true;
};
