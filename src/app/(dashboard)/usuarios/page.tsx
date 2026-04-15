'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserList } from '@/components/usuarios/UserList';
import Link from 'next/link';

export default function UsuariosPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <Link
            href="/usuarios/nuevo"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Nuevo Usuario
          </Link>
        </div>

        <UserList />
      </div>
    </ProtectedRoute>
  );
}
