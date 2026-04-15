'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MovimientoInventario, TipoMovimiento } from '@/types/inventario';

interface InventarioMovimientosProps {
  productoId?: string;
  limite?: number;
}

export function InventarioMovimientos({ productoId, limite = 50 }: InventarioMovimientosProps) {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | 'todos'>('todos');

  useEffect(() => {
    fetchMovimientos();
  }, [productoId]);

  async function fetchMovimientos() {
    try {
      let q = query(collection(db, 'movimientos_inventario'), orderBy('createdAt', 'desc'), limit(limite));

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MovimientoInventario[];

      setMovimientos(data);
    } catch (error) {
      console.error('Error fetching movimientos:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTipoColor = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-800';
      case 'salida':
        return 'bg-red-100 text-red-800';
      case 'ajuste':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case 'entrada':
        return '📥 Entrada';
      case 'salida':
        return '📤 Salida';
      case 'ajuste':
        return '🔧 Ajuste';
      default:
        return tipo;
    }
  };

  const filteredMovimientos = movimientos.filter((m) => {
    if (productoId && m.productoId !== productoId) return false;
    if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Cargando movimientos...</div>;
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as TipoMovimiento | 'todos')}
          className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="todos">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="ajuste">Ajuste</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock Ant.</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock Nuevo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovimientos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              filteredMovimientos.map((mov) => (
                <tr key={mov.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(mov.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{mov.productoNombre}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTipoColor(
                        mov.tipo
                      )}`}
                    >
                      {getTipoLabel(mov.tipo)}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {mov.tipo === 'entrada' ? '+' : '-'}
                    {mov.cantidad}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{mov.stockAnterior}</td>
                  <td className="px-4 py-3 font-medium">{mov.stockNuevo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{mov.usuarioNombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{mov.motivo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
