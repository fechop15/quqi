'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserList } from '@/components/usuarios/UserList';
import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function UsuariosPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios y sus permisos"
        actions={
          <Link href="/usuarios/nuevo">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Nuevo Usuario
            </Button>
          </Link>
        }
      />

      <UserList />
    </ProtectedRoute>
  );
}
