'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EgresoList } from '@/components/egresos/EgresoList';
import Link from 'next/link';

export default function EgresosPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Egresos</h1>
        <Link
          href="/egresos/nuevo"
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          + Nuevo Egreso
        </Link>
      </div>

      <EgresoList />
    </ProtectedRoute>
  );
}
