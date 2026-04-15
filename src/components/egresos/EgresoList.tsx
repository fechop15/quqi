'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Egreso } from '@/types/egreso';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { Edit, Trash2, TrendingDown } from 'lucide-react';

export function EgresoList() {
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const role = useRole();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEgresos();
  }, [user]);

  async function fetchEgresos() {
    if (!user) return;

    try {
      const q = query(collection(db, 'egresos'), orderBy('fecha', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Egreso[];

      setEgresos(data);
    } catch (error) {
      console.error('Error fetching egresos:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleEliminar = async (id: string) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este egreso?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'egresos', id));
      toast.success('Egreso eliminado');
      fetchEgresos();
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#64748b]">Cargando egresos...</div>;
  }

  const total = egresos.reduce((sum, egr) => sum + egr.monto, 0);

  return (
    <div>
      <div className="mb-6 rounded-xl bg-[#fef2f2] p-6 border border-danger-light">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef4444] text-white">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-[#dc2626] font-medium">Total acumulado</p>
            <p className="text-2xl font-bold text-[#dc2626]">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {egresos.length === 0 ? (
        <div className="rounded-xl border border-border-main bg-white p-12 text-center">
          <TrendingDown className="h-12 w-12 mx-auto text-[#94a3b8] mb-4" />
          <p className="text-[#64748b] mb-2">No hay egresos registrados</p>
          <Link
            href="/egresos/nuevo"
            className="text-[#6366f1] hover:text-[#4f46e5] font-medium text-sm"
          >
            Registrar primer egreso
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border-main bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b border-border-main">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {egresos.map((egreso) => (
                  <tr key={egreso.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#64748b]">{formatDate(egreso.fecha)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="warning" size="sm">{egreso.categoria}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1e293b]">{egreso.descripcion}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#ef4444]">
                      {formatCurrency(egreso.monto)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/egresos/${egreso.id}/editar`}
                        className="inline-flex items-center gap-1 text-[#6366f1] hover:text-[#4f46e5] text-sm font-medium mr-4 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Link>
                      {role.isAdmin() && (
                        <button
                          onClick={() => handleEliminar(egreso.id)}
                          disabled={deletingId === egreso.id}
                          className="inline-flex items-center gap-1 text-[#ef4444] hover:text-[#dc2626] text-sm font-medium cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === egreso.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      )}
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
