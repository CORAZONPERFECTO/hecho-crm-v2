
export interface Product {
  id: number;
  type: 'Producto' | 'Servicio';
  name: string;
  sku: string;
  category: string;
  unit?: string;
  stock: number;
  minStock: number;
  price: number;
  status: 'En Stock' | 'Stock Bajo' | 'Agotado';
}
