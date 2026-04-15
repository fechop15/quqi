'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ingreso } from '@/types/ingreso';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { Edit, Trash2, TrendingUp } from 'lucide-react';

export function IngresoList() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const role = useRole();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIngresos();
  }, [user]);

  async function fetchIngresos() {
    if (!user) return;

    try {
      const q = query(collection(db, 'ingresos'), orderBy('fecha', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ingreso[];

      setIngresos(data);
    } catch (error) {
      console.error('Error fetching ingresos:', error);
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
    const confirmed = window.confirm('¿Estás seguro de eliminar este ingreso?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'ingresos', id));
      toast.success('Ingreso eliminado');
      fetchIngresos();
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#64748b]">Cargando ingresos...</div>;
  }

  const total = ingresos.reduce((sum, ing) => sum + ing.monto, 0);

  return (
    <div>
      <div className="mb-6 rounded-xl bg-[#ecfdf5] p-6 border border-success-light">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10b981] text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-[#059669] font-medium">Total acumulado</p>
            <p className="text-2xl font-bold text-[#059669]">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {ingresos.length === 0 ? (
        <div className="rounded-xl border border-border-main bg-white p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-[#94a3b8] mb-4" />
          <p className="text-[#64748b] mb-2">No hay ingresos registrados</p>
          <Link
            href="/ingresos/nuevo"
            className="text-[#6366f1] hover:text-[#4f46e5] font-medium text-sm"
          >
            Registrar primer ingreso
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
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#64748b]">{formatDate(ingreso.fecha)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="primary" size="sm">{ingreso.categoria}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1e293b]">{ingreso.descripcion}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#10b981]">
                      {formatCurrency(ingreso.monto)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/ingresos/${ingreso.id}/editar`}
                        className="inline-flex items-center gap-1 text-[#6366f1] hover:text-[#4f46e5] text-sm font-medium mr-4 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Link>
                      {role.isAdmin() && (
                        <button
                          onClick={() => handleEliminar(ingreso.id)}
                          disabled={deletingId === ingreso.id}
                          className="inline-flex items-center gap-1 text-[#ef4444] hover:text-[#dc2626] text-sm font-medium cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === ingreso.id ? 'Eliminando...' : 'Eliminar'}
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
