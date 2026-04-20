import { Timestamp } from 'firebase/firestore';

export type VentaEstado = 'pendiente' | 'completada' | 'cancelada';
export type FormaPago = 'efectivo' | 'transferencia';

export interface VentaItem {
  productoId: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  total: number;
  items: VentaItem[];
  cliente?: string;
  vendedorId: string;
  vendedorNombre?: string;
  fecha: Timestamp;
  fechaString?: string;
  estado: VentaEstado;
  formaPago?: FormaPago;
  createdAt?: Timestamp;
}

export interface VentaForm {
  cliente?: string;
  items: Omit<VentaItem, 'subtotal'>[];
  estado: VentaEstado;
}
