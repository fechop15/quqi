'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Egreso } from '@/types/egreso';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import Link from 'next/link';

export function EgresoList() {
  const router = useRouter();
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

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEliminar = async (id: string) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este egreso?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'egresos', id));
      toast.success('Egreso eliminado exitosamente');
      fetchEgresos();
    } catch (error) {
      console.error('Error al eliminar egreso:', error);
      toast.error('Error al eliminar el egreso');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando egresos...</div>;
  }

  const total = egresos.reduce((sum, egr) => sum + egr.monto, 0);

  return (
    <div>
      <div className="mb-4 rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">
          <strong>Total acumulado:</strong> {formatCurrency(total)}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Categoría</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Monto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {egresos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay egresos registrados
                </td>
              </tr>
            ) : (
              egresos.map((egreso) => (
                <tr key={egreso.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(egreso.fecha)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                      {egreso.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{egreso.descripcion}</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    {formatCurrency(egreso.monto)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link 
                      href={`/egresos/${egreso.id}/editar`}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Editar
                    </Link>
                    {role.isAdmin() && (
                      <button
                        onClick={() => handleEliminar(egreso.id)}
                        disabled={deletingId === egreso.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === egreso.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    )}
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
