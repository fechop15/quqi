import { Timestamp } from 'firebase/firestore';

export interface Ingreso {
  id: string;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  creadoPor: string;
  createdAt: Timestamp;
}

export interface IngresoForm {
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
}
