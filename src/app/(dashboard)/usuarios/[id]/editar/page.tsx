'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserForm } from '@/components/usuarios/UserForm';
import { UsuarioForm } from '@/types/usuario';
import { toast } from 'sonner';

export default function UsuarioEditarPage() {
  const router = useRouter();
  const params = useParams();
  const usuarioId = params.id as string;

  const [usuario, setUsuario] = useState<(UsuarioForm & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const usuarioDoc = await getDoc(doc(db, 'users', usuarioId));
        if (!usuarioDoc.exists()) {
          toast.error('Usuario no encontrado');
          router.push('/usuarios');
          return;
        }

        const data = usuarioDoc.data();
        setUsuario({
          id: usuarioDoc.id,
          email: data.email || '',
          nombre: data.nombre || '',
          role: data.role || 'vendedor',
          password: '',
        });
      } catch (error) {
        console.error('Error fetching usuario:', error);
        toast.error('Error al cargar el usuario');
        router.push('/usuarios');
      } finally {
        setLoading(false);
      }
    }

    fetchUsuario();
  }, [usuarioId, router]);

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="text-center py-8">Cargando usuario...</div>
      </ProtectedRoute>
    );
  }

  if (!usuario) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="text-center py-8 text-gray-500">Usuario no encontrado</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
        </div>

        <UserForm initialData={usuario} mode="edit" />
      </div>
    </ProtectedRoute>
  );
}
