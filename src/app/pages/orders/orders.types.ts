export interface OrderItem {
  id: string;       // id del plato
  name: string;
  qty: number;
  price: number;
  //notes?: string; 
}

export type OrderStatus = 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';

export interface Order {
  id: string;                // ej. '45'
  customer?: string;
  type: 'LLEVAR' | 'MESA';
  table?: number | null;
  items: OrderItem[];
  total: number;             // derivado de items
  status: OrderStatus;
  createdAt: Date;
}
