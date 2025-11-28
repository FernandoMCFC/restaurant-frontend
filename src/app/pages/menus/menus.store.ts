// src/app/pages/menus/menus.store.ts
import { Injectable, signal } from '@angular/core';
import type { Menu } from './menus.types';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

@Injectable({ providedIn: 'root' })
export class MenusStore {
  /**
   * Menús en memoria (por ahora sin API).
   */
  private _menus = signal<Menu[]>([]);

  /** Signal de solo lectura para usar en componentes: this.store.menus() */
  menus = this._menus.asReadonly();

  /** Agrega un nuevo menú al inicio de la lista */
  add(menu: Omit<Menu, 'id'>) {
    const item: Menu = {
      id: genId(),
      name: menu.name.trim(),
      description: menu.description?.trim() || '',
      date: menu.date, // ya viene normalizado (YYYY-MM-DD)
      categoryIds: menu.categoryIds ?? [],
      productIds: menu.productIds ?? [],
    };

    this._menus.update(list => [item, ...list]);
  }

  /** Actualiza un menú existente por id */
  update(id: string, changes: Omit<Menu, 'id'>) {
    this._menus.update(list =>
      list.map(it =>
        it.id === id
          ? {
              ...it,
              name: changes.name.trim(),
              description: changes.description?.trim() || '',
              date: changes.date,
              categoryIds: changes.categoryIds ?? [],
              productIds: changes.productIds ?? [],
            }
          : it
      )
    );
  }

  /** Elimina un menú por id */
  remove(id: string) {
    this._menus.update(list => list.filter(it => it.id !== id));
  }
}
