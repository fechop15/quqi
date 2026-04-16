'use client';
export const dynamic = 'force-dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductoForm } from '@/components/productos/ProductoForm';
import { PageHeader } from '@/components/ui';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NuevoProductoPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <PageHeader
        title="Crear nuevo producto"
        description="Ingresa la información del producto"
      />

      <ProductoForm />
    </ProtectedRoute>
  );
}
