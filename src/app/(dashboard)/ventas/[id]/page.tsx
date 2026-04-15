'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Venta, VentaItem } from '@/types/venta';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function VentaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { profile } = useAuth();
  const role = useRole();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  const ventaId = params.id as string;

  useEffect(() => {
    async function fetchVenta() {
      try {
        const ventaDoc = await getDoc(doc(db, 'ventas', ventaId));
        if (!ventaDoc.exists()) {
          toast.error('Venta no encontrada');
          router.push('/ventas');
          return;
        }

        const data = { id: ventaDoc.id, ...ventaDoc.data() } as Venta;
        setVenta(data);
      } catch (error) {
        console.error('Error fetching venta:', error);
        toast.error('Error al cargar la venta');
      } finally {
        setLoading(false);
      }
    }

    fetchVenta();
  }, [ventaId, router]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
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

  const handleCancelarVenta = async () => {
    if (!venta) return;

    const confirmed = window.confirm(
      '¿Estás seguro de cancelar esta venta? Se restaurará el stock de los productos.'
    );

    if (!confirmed) return;

    setCanceling(true);

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
      
      // Recargar la venta
      const updatedVentaDoc = await getDoc(doc(db, 'ventas', venta.id));
      if (updatedVentaDoc.exists()) {
        setVenta({ id: updatedVentaDoc.id, ...updatedVentaDoc.data() } as Venta);
      }
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      toast.error('Error al cancelar la venta');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
        <div className="text-center py-8">Cargando venta...</div>
      </ProtectedRoute>
    );
  }

  if (!venta) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
        <div className="text-center py-8 text-gray-500">Venta no encontrada</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de Venta</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {venta.id.slice(0, 12)}...</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/ventas"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              ← Volver
            </Link>
            {(role.isGerente() || role.isAdmin()) && venta.estado !== 'cancelada' && (
              <button
                onClick={handleCancelarVenta}
                disabled={canceling}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canceling ? 'Cancelando...' : 'Cancelar Venta'}
              </button>
            )}
          </div>
        </div>

        {/* Info general */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Información General</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Fecha</p>
              <p className="font-medium">{formatDate(venta.fecha)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{venta.cliente || 'Mostrador'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendedor</p>
              <p className="font-medium">{venta.vendedorNombre || profile?.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                  venta.estado
                )}`}
              >
                {venta.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Productos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Precio Unit.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {venta.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">{item.producto}</td>
                    <td className="px-4 py-3">{item.cantidad}</td>
                    <td className="px-4 py-3">{formatCurrency(item.precioUnitario)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-3xl font-bold text-green-600">
              {formatCurrency(venta.total)}
            </span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
