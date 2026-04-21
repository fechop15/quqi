'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { PageHeader } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { toast } from 'sonner';
import { Settings, Loader2 } from 'lucide-react';

const defaultConfig = {
  whatsappNumber: '',
  nombreNegocio: '',
  descripcionNegocio: '',
  logoUrl: '',
  colorPrimario: '#6366f1',
};

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = useRole();
  const { config, loading: loadingConfig, guardarConfig } = useConfiguracion();
  const [formData, setFormData] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (!loadingConfig && config) {
      setFormData({
        whatsappNumber: config.whatsappNumber || '',
        nombreNegocio: config.nombreNegocio || '',
        descripcionNegocio: config.descripcionNegocio || '',
        logoUrl: config.logoUrl || '',
        colorPrimario: config.colorPrimario || '#6366f1',
      });
    }
  }, [loadingConfig, config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const success = await guardarConfig(formData, user.uid);
    setLoading(false);

    if (success) {
      toast.success('Configuración guardada correctamente');
    } else {
      toast.error('Error al guardar la configuración');
    }
  };

  const colores = [
    { value: '#6366f1', label: 'Índigo', preview: 'bg-indigo-600' },
    { value: '#4f46e5', label: 'Violeta', preview: 'bg-violet-600' },
    { value: '#7c3aed', label: 'Púrpura', preview: 'bg-purple-600' },
    { value: '#0891b2', label: 'Cian', preview: 'bg-cyan-600' },
    { value: '#059669', label: 'Esmeralda', preview: 'bg-emerald-600' },
    { value: '#16a34a', label: 'Verde', preview: 'bg-green-600' },
    { value: '#ca8a04', label: 'Amarillo', preview: 'bg-yellow-600' },
    { value: '#ea580c', label: 'Naranja', preview: 'bg-orange-600' },
    { value: '#dc2626', label: 'Rojo', preview: 'bg-red-600' },
    { value: '#db2777', label: 'Rosa', preview: 'bg-pink-600' },
  ];

  if (loadingConfig) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'gerente']}>
        <div className="text-center py-12">Cargando...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <PageHeader
        title="Configuración del Catálogo"
        description="Personaliza laappearance de tu catálogo público"
        icon={<Settings className="h-6 w-6" />}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Información del Negocio</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Nombre del negocio"
                name="nombreNegocio"
                value={formData.nombreNegocio}
                onChange={handleChange}
                placeholder="Mi Tienda"
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Descripción"
                name="descripcionNegocio"
                value={formData.descripcionNegocio}
                onChange={handleChange}
                placeholder="Descripción de tu negocio"
                rows={3}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo del negocio
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Tamaño recomendado: 400x400px (jpg, png, webp). Máximo 5MB.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingLogo}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('La imagen debe ser menor a 5MB');
                    return;
                  }

                  setUploadingLogo(true);
                  try {
                    const { uploadImage } = await import('@/lib/firebase');
                    const url = await uploadImage(file, `logo/${Date.now()}-${file.name}`);
                    setFormData((prev) => ({ ...prev, logoUrl: url }));
                    toast.success('Logo cargado correctamente');
                  } catch (error) {
                    console.error('Error uploading:', error);
                    toast.error('Error al cargar el logo');
                  }
                  setUploadingLogo(false);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingLogo && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo logo...
                </div>
              )}
              <div className="mt-2">
                <p className="text-xs text-[#64748b] mb-1">Vista previa:</p>
                <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Sin logo</span>
                  )}
                </div>
              </div>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  Eliminar logo
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1e293b] mb-4">WhatsApp</h3>
          <div className="grid gap-4">
            <Input
              label="Número de WhatsApp (sin +)"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="50612345678"
            />
            <p className="text-sm text-[#64748b]">
              Ingresa el número sin el +. Ejemplo: 50612345678
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1e293b] mb-4">Color Principal</h3>
          <div className="grid gap-3 sm:grid-cols-5">
            {colores.map((color) => (
              <label key={color.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="colorPrimario"
                  value={color.value}
                  checked={formData.colorPrimario === color.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`h-10 w-full rounded-lg ${color.preview} ${
                    formData.colorPrimario === color.value
                      ? 'ring-2 ring-offset-2 ring-gray-400'
                      : ''
                  }`}
                />
              </label>
            ))}
          </div>
          <div className="mt-4">
            <Input
              label="O usa un color personalizado"
              name="colorPrimario"
              type="color"
              value={formData.colorPrimario}
              onChange={handleChange}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>
            Guardar configuración
          </Button>
        </div>
      </form>
    </ProtectedRoute>
  );
}