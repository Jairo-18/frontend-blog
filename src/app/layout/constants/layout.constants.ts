import { SideBarItem } from '../interfaces/layout.interface';

export const SIDEBAR_ITEMS: SideBarItem[] = [
  {
    icon: 'home',
    title: 'Inicio',
    route: '/',
  },
  {
    icon: 'person',
    title: 'Perfil de usuario',
    route: '/profile',
    children: [
      {
        icon: 'visibility',
        title: 'Ver perfil',
        route: '/profile/user-profile',
      },
      {
        icon: 'lock',
        title: 'Cambiar contraseña',
        route: '/profile/change-password',
      },
    ],
  },
  {
    icon: 'movie',
    title: 'Películas',
    route: '/movies',
    children: [
      {
        icon: 'fiber_new',
        title: 'Más recientes',
        route: '/movies/recent',
      },
      {
        icon: 'star_rate',
        title: 'Mejores reseñas',
        route: '/movies/top-rated',
      },
    ],
  },
  {
    icon: 'menu_book',
    title: 'Libros',
    route: '/books',
    children: [
      {
        icon: 'fiber_new',
        title: 'Más recientes',
        route: '/books/recent',
      },
      {
        icon: 'star_rate',
        title: 'Mejores reseñas',
        route: '/books/top-rated',
      },
    ],
  },
  {
    icon: 'settings',
    title: 'Configuración',
    route: '/admin/config',
    role: 'admin',
    children: [
      {
        icon: 'people',
        title: 'Ver usuarios',
        route: '/organizational/see-users',
      },
      // {
      //   icon: 'star_rate',
      //   title: 'Mejores reseñas',
      //   route: '/books/top-rated',
      // },
    ],
  },
];
