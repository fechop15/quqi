'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { ProductoForm as ProductoFormType, Producto } from '@/types/producto';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Input, Textarea, Button, Card } from '@/components/ui';
import { Package, DollarSign, Archive, Loader2 } from 'lucide-react';

const initialForm: ProductoFormType = {
  nombre: '',
  descripcion: '',
  imagenes: [],
  precioCompra: 0,
  precioVenta: 0,
  stock: 0,
  stockMinimo: 5,
  categoria: '',
  sku: '',
  activo: true,
  mostrarEnCatalogo: true,
};

interface ProductoFormProps {
  mode?: 'create' | 'edit';
}

export function ProductoForm({ mode = 'create' }: ProductoFormProps) {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<ProductoFormType>(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fetching, setFetching] = useState(mode === 'edit');

  const productoId = params?.id as string;

  useEffect(() => {
    if (mode === 'edit' && productoId) {
      fetchProducto();
    }
  }, [mode, productoId]);

  async function fetchProducto() {
    try {
      const productoDoc = await getDoc(doc(db, 'productos', productoId));
      if (!productoDoc.exists()) {
        toast.error('Producto no encontrado');
        router.push('/productos');
        return;
      }
      const data = productoDoc.data() as Producto;
      setFormData({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        imagenes: data.imagenes || [],
        precioCompra: data.precioCompra || 0,
        precioVenta: data.precioVenta || 0,
        stock: data.stock || 0,
        stockMinimo: data.stockMinimo || 5,
        categoria: data.categoria || '',
        sku: data.sku || '',
        activo: data.activo !== false,
        mostrarEnCatalogo: data.mostrarEnCatalogo !== false,
      });
    } catch (error) {
      console.error('Error fetching producto:', error);
      toast.error('Error al cargar el producto');
      router.push('/productos');
    } finally {
      setFetching(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const registrarMovimiento = async (
    productoId: string,
    productoNombre: string,
    tipo: 'entrada' | 'salida' | 'ajuste',
    cantidad: number,
    stockAnterior: number,
    stockNuevo: number,
    motivo: string
  ) => {
    await addDoc(collection(db, 'movimientos_inventario'), {
      productoId,
      productoNombre,
      tipo,
      cantidad,
      stockAnterior,
      stockNuevo,
      motivo,
      usuarioId: user?.uid,
      usuarioNombre: profile?.nombre || 'Desconocido',
      createdAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        const docRef = await addDoc(collection(db, 'productos'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (formData.stock > 0) {
          await registrarMovimiento(
            docRef.id,
            formData.nombre,
            'entrada',
            formData.stock,
            0,
            formData.stock,
            'Stock inicial al crear producto'
          );
        }

        toast.success('Producto creado exitosamente');
      } else {
        const productoDoc = await getDoc(doc(db, 'productos', productoId));
        const stockAnterior = productoDoc.exists() ? productoDoc.data().stock || 0 : 0;
        const diffStock = formData.stock - stockAnterior;

        await updateDoc(doc(db, 'productos', productoId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });

        if (diffStock !== 0) {
          await registrarMovimiento(
            productoId,
            formData.nombre,
            diffStock > 0 ? 'entrada' : 'ajuste',
            Math.abs(diffStock),
            stockAnterior,
            formData.stock,
            'Ajuste de stock al editar producto'
          );
        }

        toast.success('Producto actualizado exitosamente');
      }

      router.push('/productos');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-12 text-[#64748b]">Cargando producto...</div>;
  }

  const margenGanancia = formData.precioVenta - formData.precioCompra;
  const porcentajeMargen = formData.precioCompra > 0 
    ? ((margenGanancia / formData.precioCompra) * 100).toFixed(1)
    : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-[#6366f1]" />
          <h3 className="text-lg font-semibold text-[#1e293b]">
            {mode === 'create' ? 'Información básica' : 'Editar información'}
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Nombre del producto *"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Producto A"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes del producto
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Tamaño recomendado: 800x800px (jpg, png, webp). Máximo 5MB por imagen.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploadingImages}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;

                setUploadingImages(true);
                const newUrls: string[] = [];
                for (const file of files) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('Cada imagen debe ser menor a 5MB');
                    continue;
                  }
                  try {
                    const { uploadImage } = await import('@/lib/firebase');
                    const url = await uploadImage(file, `productos/${Date.now()}-${file.name}`);
                    newUrls.push(url);
                  } catch (error) {
                    console.error('Error uploading:', error);
                    toast.error('Error al subir imagen');
                  }
                }
                if (newUrls.length > 0) {
                  setFormData({
                    ...formData,
                    imagenes: [...(formData.imagenes || []), ...newUrls],
                  });
                }
                setUploadingImages(false);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadingImages && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo imágenes...
              </div>
            )}
            {formData.imagenes && formData.imagenes.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {formData.imagenes.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nuevas = formData.imagenes?.filter((_, i) => i !== index);
                        setFormData({ ...formData, imagenes: nuevas || [] });
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="SKU / Código"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Ej: PROD-001"
          />

          <Input
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            placeholder="Ej: Electrónica"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-[#10b981]" />
          <h3 className="text-lg font-semibold text-[#1e293b]">Precios</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Precio de compra *"
            name="precioCompra"
            type="number"
            value={formData.precioCompra}
            onChange={handleChange}
            min={0}
            step={0.01}
            placeholder="0.00"
            required
          />

          <Input
            label="Precio de venta *"
            name="precioVenta"
            type="number"
            value={formData.precioVenta}
            onChange={handleChange}
            min={0}
            step={0.01}
            placeholder="0.00"
            required
          />
        </div>

        {formData.precioCompra > 0 && formData.precioVenta > 0 && (
          <div className="mt-4 rounded-lg bg-[#ecfdf5] p-4 border border-[#a7f3d0]">
            <p className="text-sm text-[#059669]">
              <strong>Margen de ganancia:</strong> {formatCurrency(margenGanancia)} ({porcentajeMargen}%)
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Archive className="h-5 w-5 text-[#f59e0b]" />
          <h3 className="text-lg font-semibold text-[#1e293b]">Inventario</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Stock *"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              min={0}
              placeholder="0"
              required
            />
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-[#d97706]">
                ⚠️ Cambiar el stock registrará un movimiento de inventario
              </p>
            )}
          </div>

          <Input
            label="Stock mínimo *"
            name="stockMinimo"
            type="number"
            value={formData.stockMinimo}
            onChange={handleChange}
            min={1}
            placeholder="5"
            required
            helperText="Se alertará cuando el stock sea igual o menor"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Estado</h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
              className="h-4 w-4 rounded border-[#d1d5db] text-[#6366f1] focus:ring-[#6366f1]"
            />
            <span className="text-sm text-[#475569]">
              Producto activo (visible en el sistema)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.mostrarEnCatalogo}
              onChange={(e) => setFormData((prev) => ({ ...prev, mostrarEnCatalogo: e.target.checked }))}
              className="h-4 w-4 rounded border-[#d1d5db] text-[#6366f1] focus:ring-[#6366f1]"
            />
            <span className="text-sm text-[#475569]">
              Mostrar en catálogo público
            </span>
          </label>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" isLoading={loading}>
          {mode === 'create' ? 'Guardar producto' : 'Actualizar producto'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
