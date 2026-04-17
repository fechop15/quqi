'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Usuario } from '@/types/usuario';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/types/auth';
import { toast } from 'sonner';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Edit, Trash2, UserCog, Search, Users } from 'lucide-react';

export function UserList() {
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
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
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
      await updateDoc(doc(db, 'users', usuario.id), {
        activo: !usuario.activo,
      });
      toast.success(usuario.activo ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsuarios();
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEliminar = async (id: string) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'users', id));
      toast.success('Usuario eliminado');
      fetchUsuarios();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const getRoleBadge = (role: string): 'danger' | 'primary' | 'success' | 'default' => {
    switch (role) {
      case 'admin': return 'danger';
      case 'gerente': return 'primary';
      case 'vendedor': return 'success';
      default: return 'default';
    }
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12 text-[#64748b]">Cargando usuarios...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-5 w-5" />}
        />
      </div>

      {filteredUsuarios.length === 0 ? (
        <div className="rounded-xl border border-border-main bg-white p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-[#94a3b8] mb-4" />
          <p className="text-[#64748b] mb-2">No se encontraron usuarios</p>
          <Link
            href="/usuarios/nuevo"
            className="text-[#6366f1] hover:text-[#4f46e5] font-medium text-sm"
          >
            Crear primer usuario
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border-main bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b border-border-main">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#1e293b]">{usuario.nombre}</td>
                    <td className="px-6 py-4 text-sm text-[#64748b]">{usuario.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadge(usuario.role)} size="sm">
                        {ROLES[usuario.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={usuario.activo ? 'success' : 'default'} size="sm">
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748b]">{formatDate(usuario.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/usuarios/${usuario.id}/editar`}
                        className="inline-flex items-center gap-1 text-[#6366f1] hover:text-[#4f46e5] text-sm font-medium mr-4 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleActivo(usuario)}
                        disabled={updatingId === usuario.id}
                        className="inline-flex items-center gap-1 text-[#f59e0b] hover:text-[#d97706] text-sm font-medium mr-4 cursor-pointer disabled:opacity-50"
                      >
                        <UserCog className="h-4 w-4" />
                        {updatingId === usuario.id ? '...' : usuario.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEliminar(usuario.id)}
                        className="inline-flex items-center gap-1 text-[#ef4444] hover:text-[#dc2626] text-sm font-medium cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
