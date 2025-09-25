import { MenuItem } from 'primeng/api';

export const APP_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    routerLink: ['/app/dashboard'],
  },
  {
    label: 'Configuración',
    icon: 'pi pi-cog',
    routerLink: ['/app/settings'],
  },
];
