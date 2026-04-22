import { Routes } from '@angular/router';

import { authGuard } from '@core/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'deals' },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'deals',
    loadComponent: () =>
      import('./features/deals/pages/deals-page/deals-page.component').then(
        (m) => m.DealsPageComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin-page/admin-page.component').then(
        (m) => m.AdminPageComponent,
      ),
  },
  { path: '**', redirectTo: 'deals' },
];
