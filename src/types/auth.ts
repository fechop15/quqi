export type Role = 'admin' | 'gerente' | 'vendedor';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  activo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export const ROLES: Record<Role, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'usuarios:crear',
    'usuarios:editar',
    'usuarios:eliminar',
    'productos:crear',
    'productos:editar',
    'productos:eliminar',
    'ingresos:crear',
    'ingresos:editar',
    'ingresos:eliminar',
    'egresos:crear',
    'egresos:editar',
    'egresos:eliminar',
    'ventas:crear',
    'ventas:editar',
    'ventas:eliminar',
    'reportes:ver',
    'inventario:ajustar',
  ],
  gerente: [
    'productos:crear',
    'productos:editar',
    'ingresos:crear',
    'ingresos:editar',
    'egresos:crear',
    'egresos:editar',
    'ventas:crear',
    'ventas:editar',
    'reportes:ver',
    'inventario:ajustar',
  ],
  vendedor: [
    'ventas:crear',
    'productos:ver',
  ],
};
