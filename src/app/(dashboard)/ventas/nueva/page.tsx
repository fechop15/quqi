'use client';
export const dynamic = 'force-dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { VentaForm } from '@/components/ventas/VentaForm';
import Link from 'next/link';

export default function NuevaVentaPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/ventas" className="hover:text-blue-600">
            Ventas
          </Link>
          <span>/</span>
          <span className="text-gray-900">Nueva venta</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Registrar nueva venta</h1>
      </div>

      <VentaForm />
    </ProtectedRoute>
  );
}
