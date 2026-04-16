'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { ROLES, Role } from '@/types/auth';
import { toast } from 'sonner';

export default function PerfilPage() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const role = useRole();

  const [nombre, setNombre] = useState(profile?.nombre || '');
  const [loading, setLoading] = useState(false);

  const formatRole = (role: string) => {
    return ROLES[role as Role] || role;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleUpdateNombre = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user || !profile) return;

      await updateDoc(doc(db, 'usuarios', profile.id), {
        nombre,
      });

      toast.success('Nombre actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consulta y edita tu información personal
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Info de la cuenta */}
          <div className="rounded-lg border bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Información de la cuenta</h3>

            <form onSubmit={handleUpdateNombre} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || nombre === profile?.nombre}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Actualizar nombre'}
              </button>
            </form>

            <div className="mt-6 space-y-3 border-t pt-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <p className="font-medium">{formatRole(profile?.role || '')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    profile?.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {profile?.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Miembro desde</p>
                <p className="font-medium">{formatDate(profile?.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div className="rounded-lg border bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Permisos del rol</h3>
            <p className="mb-4 text-sm text-gray-600">
              Tu rol como <strong>{formatRole(profile?.role || '')}</strong> te permite:
            </p>

            <ul className="space-y-2">
              {role.can('ventas:crear') && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✅</span> Crear y gestionar ventas
                </li>
              )}
              {role.can('productos:crear') && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✅</span> Gestionar productos e inventario
                </li>
              )}
              {role.can('ingresos:crear') && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✅</span> Registrar ingresos y egresos
                </li>
              )}
              {role.can('reportes:ver') && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✅</span> Ver reportes y estadísticas
                </li>
              )}
              {role.isAdmin() && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✅</span> Gestionar usuarios del sistema
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
