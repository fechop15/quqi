'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EgresoForm } from '@/components/egresos/EgresoForm';
import Link from 'next/link';

export default function NuevoEgresoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/egresos" className="hover:text-blue-600">
            Egresos
          </Link>
          <span>/</span>
          <span className="text-gray-900">Nuevo egreso</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Registrar nuevo egreso</h1>
      </div>

      <EgresoForm />
    </ProtectedRoute>
  );
}
