import { Timestamp } from 'firebase/firestore';
import { FormaPago } from './venta';

export interface Egreso {
  id: string;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  formaPago?: FormaPago;
  creadoPor: string;
  createdAt: Timestamp;
}

export interface EgresoForm {
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  formaPago: 'efectivo' | 'transferencia';
}
