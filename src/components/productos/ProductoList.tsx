'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Producto } from '@/types/producto';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/AuthContext';

export function ProductoList() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const role = useRole();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProductos() {
      if (!user) return;

      try {
        let q = collection(db, 'productos');

        // Vendedores solo ven productos activos
        if (role.isVendedor()) {
          q = query(q, where('activo', '==', true));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Producto[];

        setProductos(data);
      } catch (error) {
        console.error('Error fetching productos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, [user, role]);

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stockBajo = (producto: Producto) => producto.stock <= producto.stockMinimo;

  if (loading) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Precio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
              {role.isGerente() || role.isAdmin() ? (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {filteredProductos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              filteredProductos.map((producto) => (
                <tr key={producto.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      {producto.categoria && (
                        <p className="text-sm text-gray-500">{producto.categoria}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{producto.sku || '-'}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">${producto.precioVenta.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Compra: ${producto.precioCompra.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        stockBajo(producto)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {producto.stock} {stockBajo(producto) && '(Bajo)'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        producto.activo
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {(role.isGerente() || role.isAdmin()) && (
                    <td className="px-4 py-3 text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                      {role.isAdmin() && (
                        <button className="text-red-600 hover:text-red-800">Eliminar</button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
