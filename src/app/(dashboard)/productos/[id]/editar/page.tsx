'use client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductoForm } from '@/components/productos/ProductoForm';
import { PageHeader } from '@/components/ui';

export default function EditarProductoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <PageHeader
        title="Editar producto"
        description="Actualiza la información del producto"
      />

      <ProductoForm mode="edit" />
    </ProtectedRoute>
  );
}
