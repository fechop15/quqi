'use client';
export const dynamic = 'force-dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { InventarioMovimientos } from '@/components/inventario/InventarioMovimientos';

export default function InventarioMovimientosPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historial de entradas, salidas y ajustes de stock
          </p>
        </div>

        <InventarioMovimientos />
      </div>
    </ProtectedRoute>
  );
}
