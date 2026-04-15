'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ingreso } from '@/types/ingreso';
import { useAuth } from '@/contexts/AuthContext';

export function IngresoList() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
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

    fetchIngresos();
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
            </tr>
          </thead>
          <tbody>
            {ingresos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
