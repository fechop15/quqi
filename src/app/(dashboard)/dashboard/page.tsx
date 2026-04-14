'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Ventas hoy', value: '$0', icon: '💰' },
    { label: 'Productos en stock', value: '0', icon: '📦' },
    { label: 'Ingresos del mes', value: '$0', icon: '📈' },
    { label: 'Egresos del mes', value: '$0', icon: '📉' },
  ];

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Bienvenido, {profile?.nombre}
        </h1>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Accesos rápidos</h2>
            <div className="space-y-2">
              <Link
                href="/ventas/nueva"
                className="block rounded-md bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100"
              >
                ➕ Nueva venta
              </Link>
              <Link
                href="/productos"
                className="block rounded-md bg-green-50 px-4 py-2 text-green-600 hover:bg-green-100"
              >
                📦 Ver productos
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Información</h2>
            <p className="text-gray-600">
              Selecciona una opción del menú lateral para comenzar a gestionar tu negocio.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
