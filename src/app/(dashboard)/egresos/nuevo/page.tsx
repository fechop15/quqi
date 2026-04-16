'use client';
export const dynamic = 'force-dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EgresoForm } from '@/components/egresos/EgresoForm';
import { PageHeader } from '@/components/ui';

export default function NuevoEgresoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <PageHeader
        title="Registrar nuevo egreso"
        description="Ingresa la información del egreso"
      />

      <EgresoForm />
    </ProtectedRoute>
  );
}
