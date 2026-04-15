'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DashboardStats {
  ventasHoy: number;
  productosStock: number;
  ingresosMes: number;
  egresosMes: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const role = useRole();
  const [stats, setStats] = useState<DashboardStats>({
    ventasHoy: 0,
    productosStock: 0,
    ingresosMes: 0,
    egresosMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Ventas hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const ventasQuery = query(
          collection(db, 'ventas'),
          where('fecha', '>=', hoy),
          where('fecha', '<', manana)
        );
        const ventasSnapshot = await getDocs(ventasQuery);
        const ventasHoy = ventasSnapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.total || 0);
        }, 0);

        // Productos en stock
        const productosSnapshot = await getDocs(collection(db, 'productos'));
        const productosStock = productosSnapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.stock || 0);
        }, 0);

        // Ingresos del mes
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ingresosQuery = query(
          collection(db, 'ingresos'),
          where('fecha', '>=', primerDiaMes.toISOString().split('T')[0])
        );
        const ingresosSnapshot = await getDocs(ingresosQuery);
        const ingresosMes = ingresosSnapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.monto || 0);
        }, 0);

        // Egresos del mes
        const egresosQuery = query(
          collection(db, 'egresos'),
          where('fecha', '>=', primerDiaMes.toISOString().split('T')[0])
        );
        const egresosSnapshot = await getDocs(egresosQuery);
        const egresosMes = egresosSnapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.monto || 0);
        }, 0);

        setStats({
          ventasHoy,
          productosStock,
          ingresosMes,
          egresosMes,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const statsData = [
    { label: 'Ventas hoy', value: formatCurrency(stats.ventasHoy), icon: '💰', color: 'blue' },
    { label: 'Productos en stock', value: stats.productosStock.toString(), icon: '📦', color: 'green' },
    { label: 'Ingresos del mes', value: formatCurrency(stats.ingresosMes), icon: '📈', color: 'green' },
    { label: 'Egresos del mes', value: formatCurrency(stats.egresosMes), icon: '📉', color: 'red' },
  ];

  const balance = stats.ingresosMes - stats.egresosMes;

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Bienvenido, {profile?.nombre}
        </h1>

        {/* Balance del mes */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Balance del mes</p>
          <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
          <p className="mt-2 text-sm">
            {balance >= 0 ? '✅' : '⚠️'} {balance >= 0 ? 'Positivo' : 'Negativo'}
          </p>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
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

        {/* Accesos rápidos */}
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
                href="/productos/nuevo"
                className="block rounded-md bg-green-50 px-4 py-2 text-green-600 hover:bg-green-100"
              >
                📦 Nuevo producto
              </Link>
              {(role.isAdmin() || role.isGerente()) && (
                <>
                  <Link
                    href="/ingresos/nuevo"
                    className="block rounded-md bg-emerald-50 px-4 py-2 text-emerald-600 hover:bg-emerald-100"
                  >
                    📈 Registrar ingreso
                  </Link>
                  <Link
                    href="/egresos/nuevo"
                    className="block rounded-md bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    📉 Registrar egreso
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos del mes:</span>
                <span className="font-medium text-green-600">{formatCurrency(stats.ingresosMes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Egresos del mes:</span>
                <span className="font-medium text-red-600">{formatCurrency(stats.egresosMes)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium text-gray-900">Balance:</span>
                <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
