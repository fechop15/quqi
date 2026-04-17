'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EgresoForm as EgresoFormType } from '@/types/egreso';

const categorias = [
  'Compra',
  'Servicio',
  'Nómina',
  'Alquiler',
  'Servicios básicos',
  'Impuestos',
  'Mantenimiento',
  'Otro',
];

export default function EgresoEditarPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const egresoId = params.id as string;

  const [formData, setFormData] = useState<EgresoFormType>({
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: 'Compra',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchEgreso() {
      try {
        const egresoDoc = await getDoc(doc(db, 'egresos', egresoId));
        if (!egresoDoc.exists()) {
          toast.error('Egreso no encontrado');
          router.push('/egresos');
          return;
        }

        const data = egresoDoc.data();
        setFormData({
          monto: data.monto || 0,
          descripcion: data.descripcion || '',
          fecha: data.fecha || new Date().toISOString().split('T')[0],
          categoria: data.categoria || 'Compra',
        });
      } catch (error) {
        console.error('Error fetching egreso:', error);
        toast.error('Error al cargar el egreso');
        router.push('/egresos');
      } finally {
        setFetching(false);
      }
    }

    fetchEgreso();
  }, [egresoId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'egresos', egresoId), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      toast.success('Egreso actualizado exitosamente');
      router.push('/egresos');
    } catch (error) {
      console.error('Error al actualizar egreso:', error);
      toast.error('Error al actualizar el egreso');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'gerente']}>
        <div className="text-center py-8">Cargando egreso...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Editar Egreso</h1>
          <button
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            ← Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Información del egreso</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                  Monto *
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="monto"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                    className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                  Categoría *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Describa el motivo del egreso"
                />
              </div>

              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                  Fecha *
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Actualizar egreso'}
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
      </div>
    </ProtectedRoute>
  );
}
