'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { VentaList } from '@/components/ventas/VentaList';
import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function VentasPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <PageHeader
        title="Ventas"
        description="Historial de todas las ventas registradas"
        actions={
          <Link href="/ventas/nueva">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Nueva Venta
            </Button>
          </Link>
        }
      />

      <VentaList />
    </ProtectedRoute>
  );
}
