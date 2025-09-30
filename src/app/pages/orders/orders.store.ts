import { Injectable, signal } from '@angular/core';
import { Order, OrderItem } from './orders.types';

function calcTotal(items: OrderItem[]) {
  return items.reduce((acc, it) => acc + it.qty * it.price, 0);
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private _orders = signal<Order[]>([
    {
      id: '45',
      customer: 'Cliente Demo',
      type: 'MESA',
      table: 3,
      items: [
        { id: 'sopa-fideos', name: 'Sopa de Fideos', qty: 1, price: 15 },
        { id: 'agua',        name: 'Agua',           qty: 1, price: 5 },
        { id: 'coca-2l',     name: 'Coca 2lt',       qty: 1, price: 18 },
      ],
      total: 38,
      status: 'EN_PREPARACION',                 // ← nuevo estado
      createdAt: new Date(),
    }
  ]);

  orders = this._orders.asReadonly();

  addOrder(o: Omit<Order, 'id'|'total'|'createdAt'|'status'>) {
    const id = String(Date.now());
    const total = calcTotal(o.items);
    const newOrder: Order = { ...o, id, total, createdAt: new Date(), status: 'EN_PREPARACION' };
    this._orders.update(list => [newOrder, ...list]);
    return id;
  }

  setDelivered(id: string) {
    this._orders.update(list => list.map(o => o.id === id ? { ...o, status: 'ENTREGADO' } : o));
  }

  cancel(id: string) {
    this._orders.update(list => list.map(o => o.id === id ? { ...o, status: 'CANCELADO' } : o));
  }
}
