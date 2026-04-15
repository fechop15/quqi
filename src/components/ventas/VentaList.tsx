'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, getDoc, query, orderBy, where, doc, updateDoc, serverTimestamp, Query, CollectionReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Venta, VentaItem } from '@/types/venta';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';

export function VentaList() {
  const router = useRouter();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const role = useRole();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVentas();
  }, [user, role]);

  async function fetchVentas() {
    if (!user) return;

    try {
      let q: Query | CollectionReference = collection(db, 'ventas');

      // Vendedores solo ven sus propias ventas
      if (role.isVendedor()) {
        q = query(q, where('vendedorId', '==', user.uid));
      }

      q = query(q, orderBy('fecha', 'desc'));

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Venta[];

      setVentas(data);
    } catch (error) {
      console.error('Error fetching ventas:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelarVenta = async (venta: Venta) => {
    const confirmed = window.confirm(
      '¿Estás seguro de cancelar esta venta? Se restaurará el stock de los productos.'
    );

    if (!confirmed) return;

    setCancelingId(venta.id);

    try {
      // Actualizar estado de la venta
      await updateDoc(doc(db, 'ventas', venta.id), {
        estado: 'cancelada',
        updatedAt: serverTimestamp(),
      });

      // Restaurar stock de cada producto
      const restorePromises = venta.items.map(async (item: VentaItem) => {
        const productoRef = doc(db, 'productos', item.productoId);
        const productoDoc = await getDoc(productoRef);
        
        if (productoDoc.exists()) {
          const currentStock = productoDoc.data().stock || 0;
          await updateDoc(productoRef, {
            stock: currentStock + item.cantidad,
            updatedAt: serverTimestamp(),
          });
        }
      });

      await Promise.all(restorePromises);

      toast.success('Venta cancelada exitosamente');
      
      // Recargar la lista
      fetchVentas();
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      toast.error('Error al cancelar la venta');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando ventas...</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vendedor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No hay ventas registradas
              </td>
            </tr>
          ) : (
            ventas.map((venta) => (
              <tr key={venta.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                  {venta.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(venta.fecha)}</td>
                <td className="px-4 py-3 text-sm">{venta.cliente || 'Mostrador'}</td>
                <td className="px-4 py-3 text-sm">{venta.vendedorNombre || profile?.nombre}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(venta.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      venta.estado
                    )}`}
                  >
                    {venta.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button 
                    onClick={() => router.push(`/ventas/${venta.id}`)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Ver
                  </button>
                  {(role.isGerente() || role.isAdmin()) && venta.estado !== 'cancelada' && (
                    <button 
                      onClick={() => handleCancelarVenta(venta)}
                      disabled={cancelingId === venta.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {cancelingId === venta.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
