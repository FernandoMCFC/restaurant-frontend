import { Injectable, signal } from '@angular/core';
import { Order, OrderItem, OrderMode, OrderStatus } from './orders.types';

function calcTotal(items: OrderItem[]) {
  return items.reduce((acc, it) => acc + it.qty * it.price, 0);
}

let seq = 1;
function nextId() {
  return `ORD-${(seq++).toString().padStart(6, '0')}`;
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  /** Lista de pedidos */
  readonly orders = signal<Order[]>([]);

  /** Items del pedido en edición (draft) */
  readonly items = signal<OrderItem[]>([]);

  /** IDs de pedidos ya “vistos” (para el badge NUEVO en la grilla) */
  private readonly seenIds = new Set<string>();

  // =========================
  // API de items (draft)
  // =========================
  addItem(item: OrderItem) {
    const list = this.items().slice();
    list.push(item);
    this.items.set(list);
  }

  updateItem(index: number, patch: Partial<OrderItem>) {
    const list = this.items().slice();
    if (!list[index]) return;
    list[index] = { ...list[index], ...patch };
    this.items.set(list);
  }

  removeItem(index: number) {
    const list = this.items().slice();
    if (index < 0 || index >= list.length) return;
    list.splice(index, 1);
    this.items.set(list);
  }

  clearItems() {
    this.items.set([]);
  }

  resetDraft() {
    this.clearItems();
  }

  // =========================
  // Pedidos
  // =========================
  addOrder(payload: {
    customer?: string;
    type: OrderMode;
    table?: number | null;
    items?: OrderItem[];
    status?: OrderStatus;
  }) {
    const items = payload.items ?? this.items();
    const order: Order = {
      id: nextId(),
      items,
      total: calcTotal(items),
      customer: (payload.customer ?? '').trim() || undefined,
      type: payload.type,
      table: payload.type === 'MESA' ? (payload.table ?? null) : null,
      status: payload.status ?? 'EN_PREPARACION',
      createdAt: new Date().toISOString(),
    };

    this.orders.update((list) => [order, ...list]);

    // el nuevo pedido será “nuevo” hasta que markSeen(id) sea llamado
    // (no añadimos aquí a seenIds)

    this.resetDraft();
  }

  /** Cambia el estado de un pedido por id de forma inmutable */
  private setStatus(id: string, status: OrderStatus) {
    this.orders.update((list) =>
      list.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }

  /** Marcar como ENTREGADO */
  setDelivered(id: string) {
    this.setStatus(id, 'ENTREGADO');
  }

  /** Marcar como CANCELADO */
  cancel(id: string) {
    this.setStatus(id, 'CANCELADO');
  }

  // =========================
  // “Nuevo / Visto” para la grilla
  // =========================
  /** Devuelve true si el pedido aún no fue marcado como visto */
  isNew(id: string): boolean {
    return !this.seenIds.has(id);
  }

  /** Marca un pedido como visto (se invoca desde el card via (seen)) */
  markSeen(id: string) {
    this.seenIds.add(id);
  }
}
