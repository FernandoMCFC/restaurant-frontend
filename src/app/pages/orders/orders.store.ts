import { Injectable, computed, signal } from '@angular/core';
import type { Order, OrderItem, OrderStatus } from './orders.types';

function calcTotal(items: OrderItem[]) {
  return items.reduce((acc, it) => acc + it.qty * it.price, 0);
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  // =========================
  //   SECCIÓN: CARRITO (NEW)
  // =========================
  private _items = signal<OrderItem[]>([]);
  readonly items = computed(() => this._items());
  readonly total = computed(() => calcTotal(this._items()));

  addItem(item: OrderItem) {
    const normalized: OrderItem = {
      ...item,
      qty: Math.max(1, item.qty | 0),
      notes: item.notes ?? '',
      itemStatus: item.itemStatus ?? 'EN_PREPARACION'
    };
    this._items.update((arr) => [...arr, normalized]);
  }

  updateItem(index: number, patch: Partial<OrderItem>) {
    this._items.update((arr) => {
      if (index < 0 || index >= arr.length) return arr;
      const current = arr[index];
      const next: OrderItem = {
        ...current,
        ...patch,
        qty: Math.max(1, (patch.qty ?? current.qty) | 0),
        notes: (patch.notes ?? current.notes ?? ''),
        itemStatus: (patch.itemStatus ?? current.itemStatus)
      };
      const clone = arr.slice();
      clone[index] = next;
      return clone;
    });
  }

  removeItem(index: number) {
    this._items.update((arr) => arr.filter((_, i) => i !== index));
  }

  clear() {
    this._items.set([]);
  }

  // ===========================================
  //   SECCIÓN: LISTADO DE PEDIDOS (orders-list)
  // ===========================================
  readonly orders = signal<Order[]>([]);
  private _seen = signal<Set<string>>(new Set());

  isNew(id: string): boolean {
    return !this._seen().has(String(id));
  }

  markSeen(id: string) {
    const s = new Set(this._seen());
    s.add(String(id));
    this._seen.set(s);
  }

  setDelivered(id: string) {
    this._mutateOrderStatus(id, 'ENTREGADO');
  }

  cancel(id: string) {
    this._mutateOrderStatus(id, 'CANCELADO');
  }

  private _mutateOrderStatus(id: string, status: OrderStatus) {
    this.orders.update((arr) => {
      const idx = arr.findIndex((o) => String(o.id) === String(id));
      if (idx === -1) return arr;
      const current = arr[idx];
      const next: Order = { ...current, status };
      const clone = arr.slice();
      clone[idx] = next;
      return clone;
    });
  }

  // ====== NUEVO: usado por order-form.save() ======
  /** Crea un pedido nuevo en el tablero y devuelve su id */
  addOrder(payload: { customer?: string; type: 'MESA' | 'LLEVAR'; table: number | null; items: OrderItem[] }): string {
    // Genera id simple incremental por timestamp (no colisiona en local)
    const newId = String(Date.now());
    const items: OrderItem[] = (payload.items ?? []).map(it => ({
      ...it,
      qty: Math.max(1, it.qty | 0),
      notes: it.notes ?? '',
      itemStatus: it.itemStatus ?? 'EN_PREPARACION'
    }));
    const order: Order = {
      id: newId,
      customer: payload.customer,
      type: payload.type,
      table: payload.type === 'MESA' ? (payload.table ?? 1) : null,
      items,
      total: calcTotal(items),
      status: 'EN_PREPARACION',
      createdAt: new Date()
    };
    this.orders.update(arr => [...arr, order]);
    return newId;
  }
  // ================================================

  // Semilla de ejemplo
  seedIfEmpty() {
    if (this.orders().length > 0) return;
    this.orders.set([
      {
        id: '101',
        customer: 'Mesa 1',
        type: 'MESA',
        table: 1,
        items: [
          { id: 'p1', name: 'Bife de chorizo', qty: 1, price: 55, notes: '', itemStatus: 'EN_PREPARACION' },
          { id: 'p2', name: 'Milanesa', qty: 2, price: 35, notes: 'sin cebolla', itemStatus: 'EN_PREPARACION' }
        ],
        total: 55 + 2 * 35,
        status: 'EN_PREPARACION',
        createdAt: new Date()
      }
    ]);
  }

  constructor() {
    this.seedIfEmpty();
  }
}
