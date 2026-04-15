import { Role } from './auth';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  activo: boolean;
  createdAt: any;
}

export interface UsuarioForm {
  email: string;
  nombre: string;
  role: Role;
  password: string;
}
