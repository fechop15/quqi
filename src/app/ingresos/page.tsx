'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { IngresoList } from '@/components/ingresos/IngresoList';
import Link from 'next/link';

export default function IngresosPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ingresos</h1>
        <Link
          href="/ingresos/nuevo"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          + Nuevo Ingreso
        </Link>
      </div>

      <IngresoList />
    </ProtectedRoute>
  );
}
