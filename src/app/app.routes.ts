import { Routes } from '@angular/router';
import { AuthShellComponent } from './core/layout/auth-shell/auth-shell.component';
import { AdminAuthShellComponent } from './core/layout/admin-auth-shell/admin-auth-shell.component';
import { ProtectedShellComponent } from './core/layout/protected-shell/protected-shell.component';
import { authGuard } from './core/auth/services/auth-guard.service';

export const routes: Routes = [
  // 🔹 Rutas públicas (layout AuthShell)
  {
    path: '',
    component: AuthShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./features/access/pages/sign-in/sign-in.page').then(
            (m) => m.SignInPage
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/access/pages/forgot-password/forgot-password.page').then(
            (m) => m.ForgotPasswordPage
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/access/pages/reset-password/reset-password.page').then(
            (m) => m.ResetPasswordPage
          ),
      },
    ],
  },

  // ADMIN (nuevo)
    {
      path: 'admin',
      component: AdminAuthShellComponent,
      children: [
        {
          path: 'sign-in',
          loadComponent: () =>
            import('./features/admin-access/pages/admin-sign-in/admin-sign-in.page')
              .then(m => m.AdminSignInPage),
        },
        { path: '', pathMatch: 'full', redirectTo: 'sign-in' } // opcional
      ]
    },

    


  // 🔹 Rutas protegidas (layout ProtectedShell + guard)
  {
    path: 'app',
    component: ProtectedShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard.page').then(m => m.DashboardPage),
      },

      {
        path: 'settings/restaurant',
        loadComponent: () =>
          import('./features/settings/pages/restaurant-settings.page').then(m => m.RestaurantSettingsPage),
      },

      {
        path: 'tenant-select',
        loadComponent: () =>
          import('./features/access/pages/tenant-select/tenant-select.page').then(
            (m) => m.TenantSelectPage
          ),
      },

      /* {
        path: 'app',
        loadComponent: () =>
          import('./features/access/pages/unauthorized/unauthorized.page').then(
            (m) => m.UnauthorizedPage
          ), 
      }, */
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  // 🔹 Redirecciones
  //{ path: '', pathMatch: 'full', redirectTo: 'sign-in' },
  { path: '**', redirectTo: 'sign-in' },
];
