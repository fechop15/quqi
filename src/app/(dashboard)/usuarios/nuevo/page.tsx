'use client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserForm } from '@/components/usuarios/UserForm';

export default function UsuarioNuevoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
        </div>

        <UserForm mode="create" />
      </div>
    </ProtectedRoute>
  );
}
