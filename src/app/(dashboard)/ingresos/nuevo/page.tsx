'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { IngresoForm } from '@/components/ingresos/IngresoForm';
import Link from 'next/link';

export default function NuevoIngresoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/ingresos" className="hover:text-blue-600">
            Ingresos
          </Link>
          <span>/</span>
          <span className="text-gray-900">Nuevo ingreso</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Registrar nuevo ingreso</h1>
      </div>

      <IngresoForm />
    </ProtectedRoute>
  );
}
