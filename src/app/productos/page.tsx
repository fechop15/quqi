'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductoList } from '@/components/productos/ProductoList';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';

export default function ProductosPage() {
  const role = useRole();
  const canCreate = role.isGerente() || role.isAdmin();

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        {canCreate && (
          <Link
            href="/productos/nuevo"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Nuevo Producto
          </Link>
        )}
      </div>

      <ProductoList />
    </ProtectedRoute>
  );
}
