'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Venta } from '@/types/venta';

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
  const [chartData, setChartData] = useState<any[]>([]);
  const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);

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

        // Datos para el gráfico (últimos 6 meses)
        const mesesData: any[] = [];
        for (let i = 5; i >= 0; i--) {
          const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
          const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'short' });
          
          const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
          const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

          // Ingresos del mes
          const ingQuery = query(
            collection(db, 'ingresos'),
            where('fecha', '>=', primerDia.toISOString().split('T')[0]),
            where('fecha', '<=', ultimoDia.toISOString().split('T')[0])
          );
          const ingSnapshot = await getDocs(ingQuery);
          const ingTotal = ingSnapshot.docs.reduce((sum, doc) => sum + (doc.data().monto || 0), 0);

          // Egresos del mes
          const egrQuery = query(
            collection(db, 'egresos'),
            where('fecha', '>=', primerDia.toISOString().split('T')[0]),
            where('fecha', '<=', ultimoDia.toISOString().split('T')[0])
          );
          const egrSnapshot = await getDocs(egrQuery);
          const egrTotal = egrSnapshot.docs.reduce((sum, doc) => sum + (doc.data().monto || 0), 0);

          mesesData.push({
            mes: mesNombre,
            ingresos: ingTotal,
            egresos: egrTotal,
            balance: ingTotal - egrTotal,
          });
        }
        setChartData(mesesData);

        // Últimas ventas
        const ventasRecientesQuery = query(
          collection(db, 'ventas'),
          orderBy('fecha', 'desc'),
          limit(5)
        );
        const ventasRecientesSnapshot = await getDocs(ventasRecientesQuery);
        const ventasData = ventasRecientesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Venta[];
        setUltimasVentas(ventasData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

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

        {/* Gráfico de ingresos vs egresos */}
        {chartData.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Ingresos vs Egresos (Últimos 6 meses)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                  <Bar dataKey="egresos" fill="#ef4444" name="Egresos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Accesos rápidos y últimas ventas */}
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
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Últimas ventas</h2>
            {ultimasVentas.length === 0 ? (
              <p className="text-sm text-gray-500">No hay ventas recientes</p>
            ) : (
              <div className="space-y-3">
                {ultimasVentas.map((venta) => (
                  <Link
                    key={venta.id}
                    href={`/ventas/${venta.id}`}
                    className="block rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{venta.cliente || 'Mostrador'}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(venta.fecha)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(venta.total)}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            venta.estado === 'completada'
                              ? 'bg-green-100 text-green-800'
                              : venta.estado === 'cancelada'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {venta.estado}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
