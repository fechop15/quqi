'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import { generatePDFReport } from '@/components/reportes/ReportGenerator';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Filter,
} from 'lucide-react';

interface ReportData {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  totalVentas: number;
  ventasCount: number;
  productosVendidos: number;
  topProductos: { nombre: string; cantidad: number; total: number }[];
  ingresosPorCategoria: { categoria: string; total: number }[];
  egresosPorCategoria: { categoria: string; total: number }[];
  ventasPorDia: { fecha: string; total: number }[];
  ingresosListado: { fecha: string; descripcion: string; monto: number }[];
  egresosListado: { fecha: string; descripcion: string; monto: number }[];
  ventasListado: { fecha: string; cliente: string; productos: number; total: number }[];
}

export default function ReportesPage() {
  const { profile } = useAuth();
  const role = useRole();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const ingresosQuery = query(
        collection(db, 'ingresos'),
        where('fecha', '>=', fechaInicio),
        where('fecha', '<=', fechaFin)
      );
      const ingresosSnapshot = await getDocs(ingresosQuery);
      const ingresosData = ingresosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const egresosQuery = query(
        collection(db, 'egresos'),
        where('fecha', '>=', fechaInicio),
        where('fecha', '<=', fechaFin)
      );
      const egresosSnapshot = await getDocs(egresosQuery);
      const egresosData = egresosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const ventasQuery = query(collection(db, 'ventas'));
      const ventasSnapshot = await getDocs(ventasQuery);
      const ventasData = ventasSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((doc: any) => {
          const fechaStr = doc.fechaString || (doc.fecha?.toDate ? doc.fecha.toDate().toISOString().split('T')[0] : '');
          return fechaStr >= fechaInicio && fechaStr <= fechaFin;
        });

      const totalIngresos = ingresosData.reduce((sum, doc: any) => sum + (doc.monto || 0), 0);
      const totalEgresos = egresosData.reduce((sum, doc: any) => sum + (doc.monto || 0), 0);
      const totalVentas = ventasData.reduce((sum, doc: any) => sum + (doc.total || 0), 0);
      const ventasCount = ventasData.length;
      const productosVendidos = ventasData.reduce((sum: number, doc: any) => {
        return sum + (doc.items?.reduce((s: number, item: any) => s + (item.cantidad || 0), 0) || 0);
      }, 0);

      const categoriaIngresos: Record<string, number> = {};
      ingresosData.forEach((doc: any) => {
        const cat = doc.categoria || 'Sin categoría';
        categoriaIngresos[cat] = (categoriaIngresos[cat] || 0) + (doc.monto || 0);
      });
      const ingresosPorCategoria = Object.entries(categoriaIngresos)
        .map(([categoria, total]) => ({ categoria, total }))
        .sort((a, b) => b.total - a.total);

      const categoriaEgresos: Record<string, number> = {};
      egresosData.forEach((doc: any) => {
        const cat = doc.categoria || 'Sin categoría';
        categoriaEgresos[cat] = (categoriaEgresos[cat] || 0) + (doc.monto || 0);
      });
      const egresosPorCategoria = Object.entries(categoriaEgresos)
        .map(([categoria, total]) => ({ categoria, total }))
        .sort((a, b) => b.total - a.total);

      const productosMap: Record<string, { cantidad: number; total: number }> = {};
      ventasData.forEach((venta: any) => {
        (venta.items || []).forEach((item: any) => {
          const nombre = item.producto || item.nombre || 'Producto sin nombre';
          if (!productosMap[nombre]) {
            productosMap[nombre] = { cantidad: 0, total: 0 };
          }
          productosMap[nombre].cantidad += item.cantidad || 0;
          productosMap[nombre].total += (item.precioUnitario || item.precioVenta || 0) * (item.cantidad || 0);
        });
      });
      const topProductos = Object.entries(productosMap)
        .map(([nombre, data]) => ({ nombre, ...data }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

      const ventasPorDia: Record<string, number> = {};
      ventasData.forEach((doc: any) => {
        const fecha = doc.fecha || '';
        ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + (doc.total || 0);
      });
      const ventasPorDiaList = Object.entries(ventasPorDia)
        .map(([fecha, total]) => ({ fecha, total }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

      const reporte: ReportData = {
        totalIngresos,
        totalEgresos,
        balance: totalIngresos + totalVentas - totalEgresos,
        totalVentas,
        ventasCount,
        productosVendidos,
        topProductos,
        ingresosPorCategoria,
        egresosPorCategoria,
        ventasPorDia: ventasPorDiaList,
        ingresosListado: ingresosData.slice(0, 20).map((doc: any) => ({
          fecha: doc.fecha || '',
          descripcion: doc.descripcion || '',
          monto: doc.monto || 0,
        })),
        egresosListado: egresosData.slice(0, 20).map((doc: any) => ({
          fecha: doc.fecha || '',
          descripcion: doc.descripcion || '',
          monto: doc.monto || 0,
        })),
        ventasListado: ventasData.slice(0, 20).map((doc: any) => ({
          fecha: doc.fecha || '',
          cliente: doc.cliente || '',
          productos: doc.items?.reduce((s: number, item: any) => s + (item.cantidad || 0), 0) || 0,
          total: doc.total || 0,
        })),
      };

      setReportData(reporte);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    generatePDFReport({
      fechaInicio,
      fechaFin,
      ...reportData,
    });
  };

  if (!role.isGerente() && !role.isAdmin()) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'gerente']}>
        <div className="text-center py-12">
          <p className="text-[#64748b]">No tienes acceso a los reportes.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'gerente']}>
      <div className="space-y-6">
        <PageHeader
          title="Reportes Financieros"
          description="Genera reportes detallados para analizar el rendimiento de tu negocio"
          icon={<FileText className="h-6 w-6" />}
        />

        <Card>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1]"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1]"
                />
              </div>

              <Button
                onClick={handleGenerateReport}
                isLoading={generating}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </Card>

        {reportData && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="!p-0 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#10b981]/10">
                      <TrendingUp className="h-5 w-5 text-[#10b981]" />
                    </div>
                    <span className="text-sm font-medium text-[#64748b]">Ingresos</span>
                  </div>
                  <p className="text-2xl font-bold text-[#10b981]">
                    {formatCurrency(reportData.totalIngresos)}
                  </p>
                </div>
                <div className="h-1 bg-[#10b981]" />
              </Card>

              <Card className="!p-0 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#ef4444]/10">
                      <TrendingDown className="h-5 w-5 text-[#ef4444]" />
                    </div>
                    <span className="text-sm font-medium text-[#64748b]">Egresos</span>
                  </div>
                  <p className="text-2xl font-bold text-[#ef4444]">
                    {formatCurrency(reportData.totalEgresos)}
                  </p>
                </div>
                <div className="h-1 bg-[#ef4444]" />
              </Card>

              <Card className="!p-0 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${reportData.balance >= 0 ? 'bg-[#6366f1]/10' : 'bg-[#f59e0b]/10'}`}>
                      <DollarSign className={`h-5 w-5 ${reportData.balance >= 0 ? 'text-[#6366f1]' : 'text-[#f59e0b]'}`} />
                    </div>
                    <span className="text-sm font-medium text-[#64748b]">Balance</span>
                  </div>
                  <p className={`text-2xl font-bold ${reportData.balance >= 0 ? 'text-[#6366f1]' : 'text-[#f59e0b]'}`}>
                    {formatCurrency(reportData.balance)}
                  </p>
                </div>
                <div className={`h-1 ${reportData.balance >= 0 ? 'bg-[#6366f1]' : 'bg-[#f59e0b]'}`} />
              </Card>

              <Card className="!p-0 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#8b5cf6]/10">
                      <ShoppingCart className="h-5 w-5 text-[#8b5cf6]" />
                    </div>
                    <span className="text-sm font-medium text-[#64748b]">Ventas</span>
                  </div>
                  <p className="text-2xl font-bold text-[#8b5cf6]">
                    {formatCurrency(reportData.totalVentas)}
                  </p>
                  <p className="text-sm text-[#94a3b8] mt-1">
                    {reportData.ventasCount} transacciones
                  </p>
                </div>
                <div className="h-1 bg-[#8b5cf6]" />
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1e293b] mb-4">
                    Resumen de Ventas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748b]">Ventas totales</span>
                      <span className="font-semibold text-[#1e293b]">{formatCurrency(reportData.totalVentas)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748b]">Número de ventas</span>
                      <span className="font-semibold text-[#1e293b]">{reportData.ventasCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748b]">Productos vendidos</span>
                      <span className="font-semibold text-[#1e293b]">{reportData.productosVendidos}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748b]">Ticket promedio</span>
                      <span className="font-semibold text-[#1e293b]">
                        {reportData.ventasCount > 0
                          ? formatCurrency(reportData.totalVentas / reportData.ventasCount)
                          : formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1e293b] mb-4">
                    Ingresos por Categoría
                  </h3>
                  {reportData.ingresosPorCategoria.length > 0 ? (
                    <div className="space-y-3">
                      {reportData.ingresosPorCategoria.slice(0, 5).map((cat, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-[#64748b]">{cat.categoria}</span>
                            <span className="text-sm font-semibold text-[#1e293b]">{formatCurrency(cat.total)}</span>
                          </div>
                          <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#10b981] rounded-full"
                              style={{ width: `${Math.min((cat.total / reportData.totalIngresos) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#94a3b8] text-center py-4">Sin datos</p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1e293b] mb-4">
                    Egresos por Categoría
                  </h3>
                  {reportData.egresosPorCategoria.length > 0 ? (
                    <div className="space-y-3">
                      {reportData.egresosPorCategoria.slice(0, 5).map((cat, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-[#64748b]">{cat.categoria}</span>
                            <span className="text-sm font-semibold text-[#1e293b]">{formatCurrency(cat.total)}</span>
                          </div>
                          <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#ef4444] rounded-full"
                              style={{ width: `${Math.min((cat.total / reportData.totalEgresos) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#94a3b8] text-center py-4">Sin datos</p>
                  )}
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1e293b]">
                    Top 10 Productos Más Vendidos
                  </h3>
                  <Badge variant="primary">{reportData.topProductos.length} productos</Badge>
                </div>
                {reportData.topProductos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748b] uppercase">#</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748b] uppercase">Producto</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748b] uppercase">Cantidad</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748b] uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topProductos.map((producto, i) => (
                          <tr key={i} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                            <td className="py-3 px-4 text-sm text-[#94a3b8]">{i + 1}</td>
                            <td className="py-3 px-4 text-sm font-medium text-[#1e293b]">{producto.nombre}</td>
                            <td className="py-3 px-4 text-sm text-[#64748b] text-right">{producto.cantidad}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-[#1e293b] text-right">{formatCurrency(producto.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-[#94a3b8] text-center py-8">No hay ventas en este período</p>
                )}
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleExportPDF} variant="primary">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </>
        )}

        {!reportData && (
          <Card className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-[#94a3b8] mb-4" />
            <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Sin datos para mostrar</h3>
            <p className="text-sm text-[#64748b] mb-4">
              Selecciona un rango de fechas y genera el reporte para ver los resultados.
            </p>
            <Button onClick={handleGenerateReport} isLoading={generating}>
              <Filter className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
