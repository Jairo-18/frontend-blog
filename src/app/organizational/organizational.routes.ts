import { Routes } from '@angular/router';

export const organizationalRoutes: Routes = [
  {
    path: 'see-users',
    loadComponent: () => import('./pages/see-users/see-users').then((m) => m.SeeUsers),
  },
];
