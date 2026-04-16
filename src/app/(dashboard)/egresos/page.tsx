'use client';
export const dynamic = 'force-dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EgresoList } from '@/components/egresos/EgresoList';
import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function EgresosPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <PageHeader
        title="Egresos"
        description="Controla los gastos y salidas de dinero"
        actions={
          <Link href="/egresos/nuevo">
            <Button variant="danger" leftIcon={<Plus className="h-4 w-4" />}>
              Nuevo Egreso
            </Button>
          </Link>
        }
      />

      <EgresoList />
    </ProtectedRoute>
  );
}
