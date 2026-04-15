'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, getDoc, query, orderBy, where, doc, updateDoc, serverTimestamp, Query, CollectionReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Venta, VentaItem } from '@/types/venta';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { Eye, XCircle, ShoppingCart } from 'lucide-react';

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (estado: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (estado) {
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'default';
    }
  };

  const handleCancelarVenta = async (venta: Venta) => {
    const confirmed = window.confirm(
      '¿Estás seguro de cancelar esta venta? Se restaurará el stock de los productos.'
    );

    if (!confirmed) return;

    setCancelingId(venta.id);

    try {
      await updateDoc(doc(db, 'ventas', venta.id), {
        estado: 'cancelada',
        updatedAt: serverTimestamp(),
      });

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
      toast.success('Venta cancelada');
      fetchVentas();
    } catch (error) {
      toast.error('Error al cancelar');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#64748b]">Cargando ventas...</div>;
  }

  return (
    <div>
      {ventas.length === 0 ? (
        <div className="rounded-xl border border-border-main bg-white p-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-[#94a3b8] mb-4" />
          <p className="text-[#64748b] mb-2">No hay ventas registradas</p>
          <button
            onClick={() => router.push('/ventas/nueva')}
            className="text-[#6366f1] hover:text-[#4f46e5] font-medium text-sm"
          >
            Registrar primera venta
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border-main bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b border-border-main">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#64748b]">
                      {venta.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1e293b]">{formatDate(venta.fecha)}</td>
                    <td className="px-6 py-4 text-sm text-[#1e293b]">{venta.cliente || 'Mostrador'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#10b981]">{formatCurrency(venta.total)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadge(venta.estado)} size="sm">
                        {venta.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => router.push(`/ventas/${venta.id}`)}
                        className="inline-flex items-center gap-1 text-[#6366f1] hover:text-[#4f46e5] text-sm font-medium mr-4 cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                      {(role.isGerente() || role.isAdmin()) && venta.estado !== 'cancelada' && (
                        <button 
                          onClick={() => handleCancelarVenta(venta)}
                          disabled={cancelingId === venta.id}
                          className="inline-flex items-center gap-1 text-[#ef4444] hover:text-[#dc2626] text-sm font-medium cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          {cancelingId === venta.id ? 'Cancelando...' : 'Cancelar'}
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
