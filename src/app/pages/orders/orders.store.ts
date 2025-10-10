import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderItem } from './orders.types';

function calcTotal(items: OrderItem[]) {
  return items.reduce((acc, it) => acc + it.qty * it.price, 0);
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();

  private readonly _byId = computed<Map<string, Order>>(() => {
    const m = new Map<string, Order>();
    for (const o of this._orders()) m.set(o.id, o);
    return m;
  });

  private readonly _seen = new Set<string>();
  isNew(id: string) { return !this._seen.has(id); }
  markSeen(id: string) { this._seen.add(id); }

  constructor() {
    // 🔧 Normaliza: si hay pedidos sin id (p.ej. creados antes del cambio), asígnales uno
    this._orders.update(list => list.map(o => (!o.id || o.id === '#') ? { ...o, id: this.genId() } : o));
  }

  getById(id: string): Order | undefined {
    if (!id) return undefined as any;
    const o = this._byId().get(id);
    return o ? structuredClone(o) : undefined;
  }

  updateOrder(id: string, patch: Partial<Order>) {
    this._orders.update(list =>
      list.map(o => {
        if (o.id !== id) return o;
        const next: Order = { ...o, ...patch };
        if (patch.items) next.total = calcTotal(patch.items);
        return next;
      }),
    );
  }

  addOrder(partial: Omit<Order, 'total' | 'status'> & { status?: Order['status'] }) {
    const items = structuredClone(partial.items ?? []);
    const total = calcTotal(items);
    const nowIso = new Date().toISOString();

    const order: Order = {
      id: partial.id ?? this.genId(),
      items,
      total,
      type: partial.type,
      table: partial.table ?? null,
      customer: partial.customer,
      status: partial.status ?? 'EN_PREPARACION',
      createdAt: (partial as any).createdAt ?? nowIso,
    } as Order;

    this._orders.update(list => [order, ...list]);
  }

  setDelivered(id: string) {
    this._orders.update(list => list.map(o => (o.id === id ? { ...o, status: 'ENTREGADO' } : o)));
  }

  cancel(id: string) {
    this._orders.update(list => list.map(o => (o.id === id ? { ...o, status: 'CANCELADO' } : o)));
  }

  private genId() {
    const num = Math.floor(100000 + Math.random() * 900000);
    return String(num);
  }
}
