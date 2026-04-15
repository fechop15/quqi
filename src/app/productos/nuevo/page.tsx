'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductoForm } from '@/components/productos/ProductoForm';
import Link from 'next/link';

export default function NuevoProductoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/productos" className="hover:text-blue-600">
            Productos
          </Link>
          <span>/</span>
          <span className="text-gray-900">Nuevo producto</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Crear nuevo producto</h1>
      </div>

      <ProductoForm />
    </ProtectedRoute>
  );
}
