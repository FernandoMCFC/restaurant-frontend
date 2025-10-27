export interface Product {
  id: string;
  name: string;                 // nombre
  price: number;                // precio
  description?: string;         // descripcion
  photos?: string[];            // URLs/base64 temporal
  available: boolean;           // disponible
  visibleForClients: boolean;   // visible para clientes
  categoryId?: string;          // categoria (id)
}

export interface ProductCategory {
  id: string;
  name: string;
}
