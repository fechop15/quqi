import { Timestamp } from 'firebase/firestore';

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  imagenes?: string[];
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoria?: string;
  sku?: string;
  activo: boolean;
  mostrarEnCatalogo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductoForm {
  nombre: string;
  descripcion?: string;
  imagenes?: string[];
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoria?: string;
  sku?: string;
  activo: boolean;
  mostrarEnCatalogo: boolean;
}
