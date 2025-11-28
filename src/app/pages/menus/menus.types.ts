// src/app/pages/menus/menus.types.ts
export interface Menu {
  id: string;
  name: string;
  description?: string;
  /** Fecha del menú en formato YYYY-MM-DD */
  date: string;
  /** Categorías incluidas en el menú (derivadas de los productos seleccionados) */
  categoryIds: string[];
  /** Productos incluidos en el menú */
  productIds: string[];
}
