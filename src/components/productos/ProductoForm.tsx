'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { ProductoForm as ProductoFormType } from '@/types/producto';

const initialForm: ProductoFormType = {
  nombre: '',
  descripcion: '',
  precioCompra: 0,
  precioVenta: 0,
  stock: 0,
  stockMinimo: 5,
  categoria: '',
  sku: '',
  activo: true,
};

export function ProductoForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductoFormType>(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'productos'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Producto creado exitosamente');
      router.push('/productos');
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Información básica</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre del producto *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: Producto A"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Descripción del producto"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU / Código
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: PROD-001"
            />
          </div>

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <input
              type="text"
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: Electrónica"
            />
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Precios</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="precioCompra" className="block text-sm font-medium text-gray-700">
              Precio de compra *
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="precioCompra"
                name="precioCompra"
                value={formData.precioCompra}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="precioVenta" className="block text-sm font-medium text-gray-700">
              Precio de venta *
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="precioVenta"
                name="precioVenta"
                value={formData.precioVenta}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {formData.precioCompra > 0 && formData.precioVenta > 0 && (
          <div className="mt-4 rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">
              <strong>Margen de ganancia:</strong> $
              {(formData.precioVenta - formData.precioCompra).toFixed(2)} (
              {(((formData.precioVenta - formData.precioCompra) / formData.precioCompra) * 100).toFixed(1)}
              %)
            </p>
          </div>
        )}
      </div>

      {/* Inventario */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Inventario</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock inicial *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="stockMinimo" className="block text-sm font-medium text-gray-700">
              Stock mínimo *
            </label>
            <input
              type="number"
              id="stockMinimo"
              name="stockMinimo"
              value={formData.stockMinimo}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="5"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se alertará cuando el stock sea igual o menor a este valor
            </p>
          </div>
        </div>
      </div>

      {/* Estado */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Estado</h3>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="activo"
            name="activo"
            checked={formData.activo}
            onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="activo" className="text-sm font-medium text-gray-700">
            Producto activo (visible en el sistema)
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar producto'}
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
