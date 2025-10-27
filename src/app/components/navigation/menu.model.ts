export type AppMenuItem = {
  label: string;
  icon: string;
  route: string;
};

export type AppMenuGroup = {
  label: string;           // Título de sección 
  items: AppMenuItem[];    // Ítems de la sección
};

// Grupos del menu
export const APP_MENU_GROUPS: AppMenuGroup[] = [
  {
    label: 'HOME',
    items: [
      { label: 'Dashboard',     icon: 'pi pi-home', route: '/dashboard' },
    ]
  },
  {
    label: 'RESTAURANT',
    items: [
      { label: 'Configuración', icon: 'pi pi-cog',  route: '/settings' },
      { label: 'Pedidos',       icon: 'pi pi-shopping-bag', route: '/orders' },
      { label: 'Productos',     icon: 'pi pi-box', route: '/products' }
    ]
  }
];
