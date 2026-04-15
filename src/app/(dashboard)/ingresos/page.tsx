'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { IngresoList } from '@/components/ingresos/IngresoList';
import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function IngresosPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <PageHeader
        title="Ingresos"
        description="Registra y gestiona los ingresos de tu negocio"
        actions={
          <Link href="/ingresos/nuevo">
            <Button variant="success" leftIcon={<Plus className="h-4 w-4" />}>
              Nuevo Ingreso
            </Button>
          </Link>
        }
      />

      <IngresoList />
    </ProtectedRoute>
  );
}
