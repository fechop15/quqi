'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ingreso } from '@/types/ingreso';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import Link from 'next/link';

export function IngresoList() {
  const router = useRouter();
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

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEliminar = async (id: string) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar este ingreso?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'ingresos', id));
      toast.success('Ingreso eliminado exitosamente');
      fetchIngresos();
    } catch (error) {
      console.error('Error al eliminar ingreso:', error);
      toast.error('Error al eliminar el ingreso');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando ingresos...</div>;
  }

  const total = ingresos.reduce((sum, ing) => sum + ing.monto, 0);

  return (
    <div>
      <div className="mb-4 rounded-lg bg-green-50 p-4">
        <p className="text-sm text-green-800">
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
            {ingresos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay ingresos registrados
                </td>
              </tr>
            ) : (
              ingresos.map((ingreso) => (
                <tr key={ingreso.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ingreso.fecha)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {ingreso.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ingreso.descripcion}</td>
                  <td className="px-4 py-3 font-medium text-green-600">
                    {formatCurrency(ingreso.monto)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link 
                      href={`/ingresos/${ingreso.id}/editar`}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Editar
                    </Link>
                    {role.isAdmin() && (
                      <button
                        onClick={() => handleEliminar(ingreso.id)}
                        disabled={deletingId === ingreso.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === ingreso.id ? 'Eliminando...' : 'Eliminar'}
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
