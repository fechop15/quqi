'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { StatsCard, RevenueChart, QuickActions, RecentSales } from '@/components/dashboard';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import { Venta } from '@/types/venta';
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
} from 'lucide-react';

interface DashboardStats {
  ventasPeriodo: number;
  productosStock: number;
  ingresosPeriodo: number;
  egresosPeriodo: number;
}

interface ChartData {
  mes: string;
  ingresos: number;
  egresos: number;
  balance: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const role = useRole();
  const [stats, setStats] = useState<DashboardStats>({
    ventasPeriodo: 0,
    productosStock: 0,
    ingresosPeriodo: 0,
    egresosPeriodo: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);
  const [periodo, setPeriodo] = useState<'anio' | 'mes'>('anio');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    async function fetchStats() {
      try {
        const hoy = new Date();
        const productosSnapshot = await getDocs(collection(db, 'productos'));
        const productosStock = productosSnapshot.docs.reduce((sum, doc) => sum + (doc.data().stock || 0), 0);

        let fechaInicio: Date;
        let fechaFin: Date;
        let chartMeses: number;

        if (periodo === 'mes') {
          fechaInicio = new Date(selectedYear, selectedMonth, 1);
          fechaFin = new Date(selectedYear, selectedMonth + 1, 0);
          chartMeses = 6;
        } else {
          fechaInicio = new Date(selectedYear, 0, 1);
          fechaFin = new Date(selectedYear, 11, 31);
          chartMeses = 12;
        }

        const ventasQuery = query(
          collection(db, 'ventas'),
          where('fecha', '>=', fechaInicio.toISOString().split('T')[0]),
          where('fecha', '<=', fechaFin.toISOString().split('T')[0])
        );
        const ventasSnapshot = await getDocs(ventasQuery);
        const ventasPeriodo = ventasSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);

        const ingresosQuery = query(
          collection(db, 'ingresos'),
          where('fecha', '>=', fechaInicio.toISOString().split('T')[0]),
          where('fecha', '<=', fechaFin.toISOString().split('T')[0])
        );
        const ingresosSnapshot = await getDocs(ingresosQuery);
        const ingresosPeriodo = ingresosSnapshot.docs.reduce((sum, doc) => sum + (doc.data().monto || 0), 0);

        const egresosQuery = query(
          collection(db, 'egresos'),
          where('fecha', '>=', fechaInicio.toISOString().split('T')[0]),
          where('fecha', '<=', fechaFin.toISOString().split('T')[0])
        );
        const egresosSnapshot = await getDocs(egresosQuery);
        const egresosPeriodo = egresosSnapshot.docs.reduce((sum, doc) => sum + (doc.data().monto || 0), 0);

        setStats({
          ventasPeriodo,
          productosStock,
          ingresosPeriodo,
          egresosPeriodo,
        });

        const mesesData: ChartData[] = [];
        const startMonth = periodo === 'mes' ? selectedMonth : 0;
        const monthsToShow = periodo === 'mes' ? 6 : 12;

        for (let i = 0; i < monthsToShow; i++) {
          const monthOffset = periodo === 'mes' ? i - 3 : i;
          const fecha = new Date(selectedYear, startMonth + monthOffset, 1);
          if (fecha.getFullYear() !== selectedYear) continue;

          const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'short' });
          const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
          const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

          const ingQuery = query(
            collection(db, 'ingresos'),
            where('fecha', '>=', primerDia.toISOString().split('T')[0]),
            where('fecha', '<=', ultimoDia.toISOString().split('T')[0])
          );
          const ingSnapshot = await getDocs(ingQuery);
          const ingTotal = ingSnapshot.docs.reduce((sum, doc) => sum + (doc.data().monto || 0), 0);

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

    setLoading(true);
    fetchStats();
  }, [periodo, selectedYear, selectedMonth]);

  const balance = stats.ingresosPeriodo - stats.egresosPeriodo;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const meses = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
  ];

  const quickActions: { label: string; href: string; icon: React.ReactNode; variant: 'primary' | 'success' | 'warning' }[] = [
    { label: 'Nueva venta', href: '/ventas/nueva', icon: <Plus className="h-4 w-4" />, variant: 'primary' },
    { label: 'Nuevo producto', href: '/productos/nuevo', icon: <Package className="h-4 w-4" />, variant: 'success' },
  ];

  if (role.isAdmin() || role.isGerente()) {
    quickActions.push(
      { label: 'Registrar ingreso', href: '/ingresos/nuevo', icon: <TrendingUp className="h-4 w-4" />, variant: 'success' },
      { label: 'Registrar egreso', href: '/egresos/nuevo', icon: <TrendingDown className="h-4 w-4" />, variant: 'warning' }
    );
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
        <div className="space-y-6">
          <div className="h-32 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] animate-pulse" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-white border border-[#e2e8f0] animate-pulse" />
            ))}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b]">
              Bienvenido, {profile?.nombre}
            </h1>
            <p className="mt-1 text-sm text-[#475569]">
              Este es tu resumen financiero
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
              <button
                onClick={() => setPeriodo('anio')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  periodo === 'anio'
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-white text-[#64748b] hover:bg-[#f8fafc]'
                }`}
              >
                Año
              </button>
              <button
                onClick={() => setPeriodo('mes')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  periodo === 'mes'
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-white text-[#64748b] hover:bg-[#f8fafc]'
                }`}
              >
                Mes
              </button>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {periodo === 'mes' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              >
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">
                Balance {periodo === 'mes' ? `de ${meses[selectedMonth].label}` : `del ${selectedYear}`}
              </p>
              <p className="mt-2 text-4xl font-bold text-white">
                {formatCurrency(balance)}
              </p>
              <p className={`mt-2 flex items-center gap-1 text-sm ${balance >= 0 ? 'text-white/80' : 'text-red-200'}`}>
                {balance >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Tendencia positiva
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    Requiere atención
                  </>
                )}
              </p>
            </div>
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label={`Ventas (${periodo === 'mes' ? 'mes' : 'año'})`}
            value={formatCurrency(stats.ventasPeriodo)}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
          />
          <StatsCard
            label="Productos en stock"
            value={stats.productosStock.toLocaleString()}
            icon={<Package className="h-6 w-6" />}
            variant="success"
          />
          <StatsCard
            label={`Ingresos (${periodo === 'mes' ? 'mes' : 'año'})`}
            value={formatCurrency(stats.ingresosPeriodo)}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
          />
          <StatsCard
            label={`Egresos (${periodo === 'mes' ? 'mes' : 'año'})`}
            value={formatCurrency(stats.egresosPeriodo)}
            icon={<TrendingDown className="h-6 w-6" />}
            variant="danger"
          />
        </div>

        {chartData.length > 0 && (
          <RevenueChart data={chartData} />
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions actions={quickActions} />
          <RecentSales sales={ultimasVentas} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
