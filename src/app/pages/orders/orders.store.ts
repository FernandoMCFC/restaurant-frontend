import { Injectable, signal } from '@angular/core';
import { Order, OrderItem } from './orders.types';

function calcTotal(items: OrderItem[]) {
  return items.reduce((acc, it) => acc + it.qty * it.price, 0);
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  /** IDs de pedidos recién creados para resaltar en UI */
  newIds = signal<string[]>([]);

  private _orders = signal<Order[]>([
    {
      id: '45',
      customer: 'Cliente Demo',
      type: 'MESA',
      table: 3,
      items: [
        { id: 'sopa-fideos', name: 'Sopa de Fideos', qty: 1, price: 15 },
        { id: 'agua', name: 'Agua', qty: 1, price: 5 },
        { id: 'coca-2l', name: 'Coca 2lt', qty: 1, price: 18 },
      ],
      total: 38,
      status: 'EN_PREPARACION',
      createdAt: new Date(),
    },
  ]);

  /** Lista de pedidos (readonly) */
  orders = this._orders.asReadonly();

  /** Agrega pedido y lo marca como “nuevo” para la UI */
  addOrder(o: Omit<Order, 'id' | 'total' | 'createdAt' | 'status'>) {
    const id = String(Math.floor(Math.random() * 900) + 100);
    const total = calcTotal(o.items);
    const newOrder: Order = {
      ...o,
      id,
      total,
      createdAt: new Date(),
      status: 'EN_PREPARACION',
    };
    this._orders.update((list) => [newOrder, ...list]);
    this.newIds.update((a) => [id, ...a]); // 👈 marcar como NUEVO
    return id;
  }

  setDelivered(id: string) {
    this._orders.update((list) =>
      list.map((o) => (o.id === id ? { ...o, status: 'ENTREGADO' } : o)),
    );
  }

  cancel(id: string) {
    this._orders.update((list) =>
      list.map((o) => (o.id === id ? { ...o, status: 'CANCELADO' } : o)),
    );
  }

  /** Indica si el pedido debe mostrarse como 'nuevo' */
  isNew(id: string) {
    return this.newIds().includes(id);
  }

  /** Quita el resaltado de 'nuevo' (p. ej. al hacer click en la tarjeta) */
  markSeen(id: string) {
    this.newIds.update((a) => a.filter((x) => x !== id));
  }
}
