'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where, Query, CollectionReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Producto } from '@/types/producto';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { Input, Badge, Card } from '@/components/ui';
import { Search, Edit, Trash2, Package } from 'lucide-react';

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
        let q: Query | CollectionReference = collection(db, 'productos');

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

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'productos', id));
      setProductos(productos.filter((p) => p.id !== id));
      toast.success('Producto eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-text-muted">Cargando productos...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-5 w-5" />}
        />
      </div>

      {filteredProductos.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No hay productos registrados</p>
          {role.isGerente() || role.isAdmin() ? (
            <Link href="/productos/nuevo" className="text-primary-500 hover:text-primary-600 text-sm font-medium mt-2 inline-block">
              Crear primer producto
            </Link>
          ) : null}
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Margen</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Estado</th>
                  {(role.isGerente() || role.isAdmin()) && (
                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProductos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">{producto.nombre}</p>
                      {producto.categoria && (
                        <p className="text-sm text-text-muted">{producto.categoria}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">{producto.sku || '-'}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">{formatCurrency(producto.precioVenta)}</p>
                      <p className="text-xs text-text-muted">Compra: {formatCurrency(producto.precioCompra)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const valorMargen = producto.precioVenta - producto.precioCompra;
                        const margen = producto.precioVenta > 0
                          ? (valorMargen / producto.precioVenta * 100)
                          : 0;
                        const variant = margen >= 30 ? 'success' : margen >= 15 ? 'warning' : 'danger';
                        return (
                          <div>
                            <Badge variant={variant}>
                              {margen.toFixed(1)}%
                            </Badge>
                            <p className="text-xs text-text-muted mt-1">{formatCurrency(valorMargen)}</p>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={stockBajo(producto) ? 'danger' : 'success'} dot>
                        {producto.stock} {stockBajo(producto) && '(Bajo)'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={producto.activo ? 'primary' : 'default'}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    {(role.isGerente() || role.isAdmin()) && (
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/productos/${producto.id}/editar`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Link>
                        {role.isAdmin() && (
                          <button
                            onClick={() => handleDelete(producto.id, producto.nombre)}
                            className="inline-flex items-center gap-1 text-danger-500 hover:text-danger-600 text-sm font-medium ml-4 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
