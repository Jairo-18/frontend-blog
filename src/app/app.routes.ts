import { Routes } from '@angular/router';
import { DefaultLayout } from './layout/pages/default-layout/default-layout';
import { noAuthGuard } from './shared/guards/noAuth.guard';
import { authGuard } from './shared/guards/auth.guard';

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
        canActivate: [noAuthGuard],
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.routes').then((m) => m.profileRoutes),
        canActivate: [authGuard],
      },
      {
        path: 'organizational',
        loadChildren: () =>
          import('./organizational/organizational.routes').then((m) => m.organizationalRoutes),
        canActivate: [authGuard],
      },
    ],
  },

  {
    path: '**',
    redirectTo: '/home',
  },
];
