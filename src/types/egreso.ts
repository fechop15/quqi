import { Timestamp } from 'firebase/firestore';

export interface Egreso {
  id: string;
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  creadoPor: string;
  createdAt: Timestamp;
}

export interface EgresoForm {
  monto: number;
  descripcion: string;
  fecha: string;
  categoria: string;
}
