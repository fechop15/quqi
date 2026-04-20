'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { EgresoForm as EgresoFormType } from '@/types/egreso';
import { Input, Textarea, Select, Button, Card } from '@/components/ui';
import { TrendingDown } from 'lucide-react';

const categorias = [
  { value: 'Compra', label: 'Compra' },
  { value: 'Servicio', label: 'Servicio' },
  { value: 'Nómina', label: 'Nómina' },
  { value: 'Alquiler', label: 'Alquiler' },
  { value: 'Servicios básicos', label: 'Servicios básicos' },
  { value: 'Impuestos', label: 'Impuestos' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Otro', label: 'Otro' },
];

const formasPago = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
];

const initialForm: EgresoFormType = {
  monto: 0,
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  categoria: 'Compra',
  formaPago: 'efectivo',
};

export function EgresoForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<EgresoFormType>(initialForm);
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
    setLoading(false);

    try {
      await addDoc(collection(db, 'egresos'), {
        ...formData,
        creadoPor: user?.uid,
        createdAt: serverTimestamp(),
      });

      toast.success('Egreso registrado exitosamente');
      router.push('/egresos');
    } catch (error) {
      console.error('Error al registrar egreso:', error);
      toast.error('Error al registrar el egreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-[#ef4444]" />
          <h3 className="text-lg font-semibold text-[#1e293b]">Información del egreso</h3>
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
              placeholder="Describa el motivo del egreso"
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

          <Select
            label="Forma de pago *"
            name="formaPago"
            value={formData.formaPago}
            onChange={handleChange}
            options={formasPago}
            required
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="danger" isLoading={loading}>
          Guardar egreso
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
