'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { IngresoForm as IngresoFormType } from '@/types/ingreso';
import { Input, Textarea, Select, Button, Card } from '@/components/ui';
import { TrendingUp } from 'lucide-react';

const categorias = [
  { value: 'Venta', label: 'Venta' },
  { value: 'Servicio', label: 'Servicio' },
  { value: 'Inversión', label: 'Inversión' },
  { value: 'Préstamo', label: 'Préstamo' },
  { value: 'Otro', label: 'Otro' },
];

const initialForm: IngresoFormType = {
  monto: 0,
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  categoria: 'Venta',
};

export function IngresoForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<IngresoFormType>(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      await addDoc(collection(db, 'ingresos'), {
        ...formData,
        creadoPor: user?.uid,
        createdAt: serverTimestamp(),
      });

      toast.success('Ingreso registrado exitosamente');
      router.push('/ingresos');
    } catch (error) {
      console.error('Error al registrar ingreso:', error);
      toast.error('Error al registrar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#10b981]" />
          <h3 className="text-lg font-semibold text-[#1e293b]">Información del ingreso</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Monto *"
            name="monto"
            type="number"
            value={formData.monto}
            onChange={handleChange}
            min={0.01}
            step={0.01}
            placeholder="0.00"
            required
          />

          <Select
            label="Categoría *"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            options={categorias}
            required
          />

          <div className="sm:col-span-2">
            <Textarea
              label="Descripción *"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describa el origen del ingreso"
              rows={3}
              required
            />
          </div>

          <Input
            label="Fecha *"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="success" isLoading={loading}>
          Guardar ingreso
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
