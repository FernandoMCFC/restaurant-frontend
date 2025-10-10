// Tipos base del módulo de pedidos.

// Estado por ítem (coincide con tu modal product-add)
export type ItemStatus =
  | 'EN_PREPARACION'
  | 'PREPARADO'
  | 'ENTREGADO'
  | 'CANCELADO';

// Estado del pedido completo
export type OrderStatus =
  | 'EN_PREPARACION'
  | 'ENTREGADO'
  | 'CANCELADO';

export type OrderMode = 'MESA' | 'LLEVAR';

export interface OrderItem {
  id: string;          // id del producto
  name: string;        // nombre del producto
  qty: number;         // cantidad
  price: number;       // precio unitario
  notes?: string;      // notas opcionales del ítem
  itemStatus?: ItemStatus; // <--- CLAVE: tu UI usa "itemStatus"
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;

  // Campos del drawer
  customer?: string;       // nombre del cliente
  type: OrderMode;         // MESA | LLEVAR
  table?: number | null;   // número de mesa (solo si MESA)

  // Metadatos
  status?: OrderStatus;    // estado del pedido
  createdAt?: string;      // ISO
}
