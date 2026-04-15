'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Egreso } from '@/types/egreso';
import { useAuth } from '@/contexts/AuthContext';

export function EgresoList() {
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
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

    fetchEgresos();
  }, [user]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            </tr>
          </thead>
          <tbody>
            {egresos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No hay egresos registrados
                </td>
              </tr>
            ) : (
              egresos.map((egreso) => (
                <tr key={egreso.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDate(egreso.fecha)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                      {egreso.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{egreso.descripcion}</td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    {formatCurrency(egreso.monto)}
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
