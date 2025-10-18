import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: 'user-profile',
    loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
  },
  {
    path: 'register-profile',
    loadComponent: () =>
      import('./pages/register-profile/register-profile').then((m) => m.RegisterProfile),
  },
];
