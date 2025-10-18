export interface SideBarItem {
  icon: string;
  title: string;
  route?: string;
  children?: SideBarItem[];
  requiresAuth?: boolean;
  role?: 'admin' | 'user';
}
