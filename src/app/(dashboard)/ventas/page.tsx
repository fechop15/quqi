'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { VentaList } from '@/components/ventas/VentaList';
import Link from 'next/link';

export default function VentasPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        <Link
          href="/ventas/nueva"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nueva Venta
        </Link>
      </div>

      <VentaList />
    </ProtectedRoute>
  );
}
