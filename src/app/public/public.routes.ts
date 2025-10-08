import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
export const publicRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        component: Home,
      },
    ],
  },
];
