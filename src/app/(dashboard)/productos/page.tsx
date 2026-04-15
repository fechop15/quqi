'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductoList } from '@/components/productos/ProductoList';
import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';
import { Plus } from 'lucide-react';

export default function ProductosPage() {
  const role = useRole();
  const canCreate = role.isGerente() || role.isAdmin();

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <PageHeader
        title="Productos"
        description="Gestiona tu catálogo de productos"
        actions={
          canCreate && (
            <Link href="/productos/nuevo">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Nuevo Producto
              </Button>
            </Link>
          )
        }
      />

      <ProductoList />
    </ProtectedRoute>
  );
}
