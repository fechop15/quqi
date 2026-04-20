import { Timestamp } from 'firebase/firestore';

export interface Configuracion {
  id: string;
  whatsappNumber: string;
  nombreNegocio: string;
  descripcionNegocio: string;
  logoUrl: string;
  colorPrimario: string;
  creadoPor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ConfiguracionForm {
  whatsappNumber: string;
  nombreNegocio: string;
  descripcionNegocio: string;
  logoUrl: string;
  colorPrimario: string;
}