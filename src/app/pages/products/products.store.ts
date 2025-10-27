import { Injectable, signal } from '@angular/core';
import type { Product, ProductCategory } from './products.types';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  // Semillas de demo (puedes reemplazar luego por API)
  private _categories = signal<ProductCategory[]>([
    { id: 'cat1', name: 'Carnes' },
    { id: 'cat2', name: 'Bebidas' },
    { id: 'cat3', name: 'Entradas' },
    { id: 'cat4', name: 'Postres' },
  ]);

  private _products = signal<Product[]>([]);

  categories = this._categories.asReadonly();
  products   = this._products.asReadonly();

  add(p: Omit<Product, 'id'>) {
    this._products.update(list => [{ ...p, id: genId() }, ...list]);
  }

  update(id: string, changes: Partial<Product>) {
    this._products.update(list => list.map(it => it.id === id ? { ...it, ...changes } : it));
  }

  remove(id: string) {
    this._products.update(list => list.filter(it => it.id !== id));
  }
}
