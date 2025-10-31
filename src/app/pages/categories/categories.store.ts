// src/app/pages/categories/categories.store.ts
import { Injectable, signal, computed } from '@angular/core';

export interface Category {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  deleted?: boolean; // borrado lógico
}

const genId = () => Math.random().toString(36).slice(2, 10);

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private _items = signal<Category[]>([
    { id: 'cat1', name: 'Carnes',   visible: true,  order: 1, deleted: false },
    { id: 'cat2', name: 'Bebidas',  visible: true,  order: 2, deleted: false },
    { id: 'cat3', name: 'Entradas', visible: true,  order: 3, deleted: false },
    { id: 'cat4', name: 'Postres',  visible: false, order: 4, deleted: false },
  ]);

  readonly items = this._items.asReadonly();

  readonly itemsActive = computed(() =>
    this._items().filter(c => !c.deleted)
  );

 
  readonly itemsDeleted = computed(() =>
    this._items().filter(c => !!c.deleted)
  );

  
  readonly itemsSorted = computed(() =>
    [...this._items().filter(c => !c.deleted)].sort((a, b) => a.order - b.order)
  );

  readonly minOrder = computed(() =>
    this.itemsActive().length ? Math.min(...this.itemsActive().map(c => c.order)) : 1
  );
  readonly maxOrder = computed(() =>
    this.itemsActive().length ? Math.max(...this.itemsActive().map(c => c.order)) : 0
  );

  getById(id: string) {
    return this._items().find(c => c.id === id);
  }

  add(name: string, visible: boolean, order?: number) {
    const next: Category = {
      id: genId(),
      name: name.trim(),
      visible,
      order: Number(order ?? this.maxOrder() + 1),
      deleted: false
    };
    this._items.set([...this._items(), next]);
    this.reindex();
  }

  updateName(id: string, name: string) {
    const nm = name.trim();
    if (!nm) return;
    this._items.update(list => list.map(c => c.id === id ? ({ ...c, name: nm }) : c));
  }

  
  updateBasic(id: string, data: { name?: string; visible?: boolean }) {
    this._items.update(list => list.map(c => {
      if (c.id !== id) return c;
      const patch: Partial<Category> = {};
      if (typeof data.name === 'string')  patch.name = data.name.trim();
      if (typeof data.visible === 'boolean') patch.visible = data.visible;
      return { ...c, ...patch };
    }));
  }

  toggleVisible(id: string) {
    this._items.update(list => list.map(c => c.id === id ? ({ ...c, visible: !c.visible }) : c));
  }

  /** Borrado lógico */
  remove(id: string) {
    this._items.update(list => list.map(c => c.id === id ? ({ ...c, deleted: true }) : c));
    this.reindex(); 
  }

  /** Restaurar una eliminada */
  restore(id: string) {
    this._items.update(list => list.map(c => c.id === id ? ({ ...c, deleted: false }) : c));
    
    const max = this.maxOrder();
    this._items.update(list => list.map(c => c.id === id ? ({ ...c, order: max + 1 }) : c));
  }

  moveUp(id: string) {
    const list = [...this._items().filter(c => !c.deleted)];
    const cur = list.find(c => c.id === id); if (!cur) return;
    const upper = list.filter(c => c.order < cur.order).sort((a,b)=>b.order-a.order)[0];
    if (!upper) return;

    const swap = (a: Category, b: Category) => {
      const all = [...this._items()];
      const ai = all.findIndex(x => x.id === a.id);
      const bi = all.findIndex(x => x.id === b.id);
      [all[ai].order, all[bi].order] = [all[bi].order, all[ai].order];
      this._items.set(all);
    };
    swap(cur, upper);
  }

  moveDown(id: string) {
    const list = [...this._items().filter(c => !c.deleted)];
    const cur = list.find(c => c.id === id); if (!cur) return;
    const lower = list.filter(c => c.order > cur.order).sort((a,b)=>a.order-b.order)[0];
    if (!lower) return;

    const swap = (a: Category, b: Category) => {
      const all = [...this._items()];
      const ai = all.findIndex(x => x.id === a.id);
      const bi = all.findIndex(x => x.id === b.id);
      [all[ai].order, all[bi].order] = [all[bi].order, all[ai].order];
      this._items.set(all);
    };
    swap(cur, lower);
  }

  
  applyUiOrder(sorted: Category[]) {
    const idToOrder = new Map(sorted.map((c, i) => [c.id, i + 1]));
    this._items.update(list => list.map(c =>
      c.deleted ? c : ({ ...c, order: idToOrder.get(c.id) ?? c.order })
    ));
  }

  
  private reindex() {
    const all = [...this._items()];
    const actives = all.filter(c => !c.deleted).sort((a,b)=>a.order-b.order);
    actives.forEach((c,i)=> c.order = i+1);
    
    const byId = new Map(all.map(c => [c.id, c]));
    actives.forEach(c => byId.set(c.id, c));
    this._items.set([...byId.values()]);
  }
}
