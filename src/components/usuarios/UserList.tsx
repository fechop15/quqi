'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Usuario } from '@/types/usuario';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/types/auth';
import { toast } from 'sonner';
import Link from 'next/link';

export function UserList() {
  const router = useRouter();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, [user]);

  async function fetchUsuarios() {
    if (!user) return;

    try {
      const q = query(collection(db, 'usuarios'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Usuario[];

      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActivo = async (usuario: Usuario) => {
    setUpdatingId(usuario.id);
    try {
      await updateDoc(doc(db, 'usuarios', usuario.id), {
        activo: !usuario.activo,
      });
      toast.success(
        usuario.activo ? 'Usuario desactivado exitosamente' : 'Usuario activado exitosamente'
      );
      fetchUsuarios();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar el usuario');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEliminar = async (id: string) => {
    const confirmed = window.confirm(
      '¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'usuarios', id));
      toast.success('Usuario eliminado exitosamente');
      fetchUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'gerente':
        return 'bg-blue-100 text-blue-800';
      case 'vendedor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>;
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Creado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{usuario.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{usuario.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleColor(
                        usuario.role
                      )}`}
                    >
                      {ROLES[usuario.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        usuario.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(usuario.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/usuarios/${usuario.id}/editar`}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleToggleActivo(usuario)}
                      disabled={updatingId === usuario.id}
                      className="text-yellow-600 hover:text-yellow-800 mr-3 disabled:opacity-50"
                    >
                      {updatingId === usuario.id
                        ? 'Actualizando...'
                        : usuario.activo
                        ? 'Desactivar'
                        : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleEliminar(usuario.id)}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={updatingId === usuario.id}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
