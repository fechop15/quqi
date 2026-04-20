import { Timestamp } from 'firebase/firestore';
import { FormaPago } from './venta';

export interface Ingreso {
  id: string;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  formaPago?: FormaPago;
  creadoPor: string;
  createdAt: Timestamp;
}

export interface IngresoForm {
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  formaPago: 'efectivo' | 'transferencia';
}
