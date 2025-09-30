import { Routes } from '@angular/router';
import { AuthShellComponent } from './core/layout/auth-shell/auth-shell.component';
import { AdminAuthShellComponent } from './core/layout/admin-auth-shell/admin-auth-shell.component';
import { authGuard } from './core/auth/services/auth-guard.service';

import { LayoutShellComponent } from './components/layout/shell/layout-shell.component';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { RestaurantSettingsPage } from './pages/settings/restaurant-settings.page';

export const routes: Routes = [
  // 1) Raíz → dashboard
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  // 2) PROTEGIDAS (PRIMERO para que tengan prioridad sobre las públicas en path: '')
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => Promise.resolve(DashboardPage) },
      { path: 'settings',  loadComponent: () => Promise.resolve(RestaurantSettingsPage) },
      { path: 'orders', loadComponent: () => import('./pages/orders/orders-list.page').then(m => m.OrdersListPage)},
      { path: 'orders/new', loadComponent: () => import('./pages/orders/order-form.page').then(m => m.OrderFormPage)},
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  // 3) PÚBLICAS (NO tocamos /sign-in ni sus paths)
  {
    path: '',
    component: AuthShellComponent,
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./features/access/pages/sign-in/sign-in.page').then((m) => m.SignInPage),
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

  // 4) ADMIN (se mantiene)
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
      { path: '', pathMatch: 'full', redirectTo: 'sign-in' }
    ]
  },

  // 5) Fallback → dashboard (si no hay sesión, el guard te lleva a /sign-in)
  { path: '**', redirectTo: 'dashboard' },
];
