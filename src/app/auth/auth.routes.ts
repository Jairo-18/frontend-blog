import { Routes } from '@angular/router';
import { AuthCallBack } from './pages/auth-call-back/auth-call-back';

export const authRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then((m) => m.Register),
      },
      {
        path: 'recover-password',
        loadComponent: () =>
          import('./pages/recover-password/recover-password').then((m) => m.RecoverPassword),
      },
      {
        path: 'callback',
        component: AuthCallBack,
      },
      {
        path: 'send-email',
        loadComponent: () => import('./pages/send-email/send-email').then((m) => m.SendEmail),
      },
    ],
  },
];
