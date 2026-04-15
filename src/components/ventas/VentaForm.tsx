'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Producto } from '@/types/producto';
import { VentaItem } from '@/types/venta';
import { formatCurrency } from '@/lib/utils';

interface VentaItemForm extends Omit<VentaItem, 'subtotal'> {
  subtotal: number;
}

export function VentaForm() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [items, setItems] = useState<VentaItemForm[]>([]);
  const [cliente, setCliente] = useState('');
  const [loading, setLoading] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // Cargar productos activos
  useEffect(() => {
    async function fetchProductos() {
      const q = query(collection(db, 'productos'), where('activo', '==', true));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Producto[];
      setProductos(data);
    }
    fetchProductos();
  }, []);

  // Agregar item al carrito
  const agregarItem = () => {
    if (!productoSeleccionado) {
      toast.error('Selecciona un producto');
      return;
    }

    const producto = productos.find((p) => p.id === productoSeleccionado);
    if (!producto) return;

    if (cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (cantidad > producto.stock) {
      toast.error(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    // Verificar si ya está en el carrito
    const existe = items.find((item) => item.productoId === productoSeleccionado);
    if (existe) {
      toast.error('Este producto ya está en la venta');
      return;
    }

    const nuevoItem: VentaItemForm = {
      productoId: producto.id,
      producto: producto.nombre,
      cantidad,
      precioUnitario: producto.precioVenta,
      subtotal: producto.precioVenta * cantidad,
    };

    setItems([...items, nuevoItem]);
    setProductoSeleccionado('');
    setCantidad(1);
  };

  // Eliminar item del carrito
  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Procesar venta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Agrega al menos un producto a la venta');
      return;
    }

    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    setLoading(true);

    try {
      // Crear la venta
      const ventaData = {
        total,
        items,
        cliente: cliente || 'Mostrador',
        vendedorId: user.uid,
        vendedorNombre: profile?.nombre,
        estado: 'completada' as const,
        fecha: serverTimestamp(),
        fechaString: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      };

      const ventaRef = await addDoc(collection(db, 'ventas'), ventaData);

      // Actualizar stock y registrar movimientos
      const batchPromises = items.map(async (item) => {
        const productoRef = doc(db, 'productos', item.productoId);
        const productoDoc = await getDoc(productoRef);
        const stockAnterior = productoDoc.exists() ? productoDoc.data().stock || 0 : 0;
        const stockNuevo = stockAnterior - item.cantidad;

        await updateDoc(productoRef, {
          stock: stockNuevo,
          updatedAt: serverTimestamp(),
        });

        // Registrar movimiento de salida
        await addDoc(collection(db, 'movimientos_inventario'), {
          productoId: item.productoId,
          productoNombre: item.producto,
          tipo: 'salida',
          cantidad: item.cantidad,
          stockAnterior,
          stockNuevo,
          motivo: `Venta ${ventaRef.id.slice(0, 8)}`,
          usuarioId: user.uid,
          usuarioNombre: profile?.nombre || 'Desconocido',
          createdAt: serverTimestamp(),
        });
      });

      await Promise.all(batchPromises);

      toast.success('Venta registrada exitosamente');
      router.push('/ventas');
    } catch (error) {
      console.error('Error al registrar venta:', error);
      toast.error('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cliente */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Información del cliente</h3>
        <div>
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">
            Nombre del cliente (opcional)
          </label>
          <input
            type="text"
            id="cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Cliente de mostrador"
          />
        </div>
      </div>

      {/* Agregar productos */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Agregar productos</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="producto" className="block text-sm font-medium text-gray-700">
              Producto *
            </label>
            <select
              id="producto"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar producto...</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - {formatCurrency(producto.precioVenta)} (Stock: {producto.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
              Cantidad *
            </label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              min="1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={agregarItem}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Agregar producto
        </button>
      </div>

      {/* Items de la venta */}
      {items.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Productos agregados</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Producto</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cantidad</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Precio</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subtotal</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">{item.producto}</td>
                    <td className="px-4 py-3">{item.cantidad}</td>
                    <td className="px-4 py-3">{formatCurrency(item.precioUnitario)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(item.subtotal)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => eliminarItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total:</td>
                  <td className="px-4 py-3 text-lg font-bold text-green-600">
                    Total: {formatCurrency(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando...' : `Registrar venta (${items.length} productos)`}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
