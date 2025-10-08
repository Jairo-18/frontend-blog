import { Routes } from '@angular/router';
import { DefaultLayout } from './layout/pages/default-layout/default-layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayout,
    children: [
      {
        path: '',
        loadChildren: () => import('./public/public.routes').then((m) => m.publicRoutes),
      },
      {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '/home',
  },
];
