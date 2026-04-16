'use client';
export const dynamic = 'force-dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { IngresoForm } from '@/components/ingresos/IngresoForm';
import { PageHeader } from '@/components/ui';

export default function NuevoIngresoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <PageHeader
        title="Registrar nuevo ingreso"
        description="Ingresa la información del ingreso"
      />

      <IngresoForm />
    </ProtectedRoute>
  );
}
