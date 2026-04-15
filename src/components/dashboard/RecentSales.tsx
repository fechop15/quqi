'use client';
import { Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Venta } from '@/types/venta';

interface RecentSalesProps {
  sales: Venta[];
  title?: string;
}

function formatDate(timestamp: any): string {
  if (!timestamp) return '-';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

function getStatusBadge(estado: string): 'success' | 'danger' | 'warning' {
  const variants: Record<string, 'success' | 'danger' | 'warning'> = {
    completada: 'success',
    cancelada: 'danger',
    pendiente: 'warning',
  };
  return variants[estado] || 'warning';
}

export function RecentSales({ sales, title = 'Ventas recientes' }: RecentSalesProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-border-main overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1e293b]">{title}</h3>
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingCart className="h-12 w-12 text-[#94a3b8] mb-3" />
          <p className="text-sm text-[#475569]">No hay ventas recientes</p>
          <Link
            href="/ventas/nueva"
            className="mt-2 text-sm text-[#6366f1] hover:text-[#4f46e5] font-medium"
          >
            Registrar primera venta
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((venta) => (
            <Link
              key={venta.id}
              href={`/ventas/${venta.id}`}
              className="block rounded-lg border border-border-main p-4 transition-all duration-200 hover:border-[#818cf8] hover:bg-[#eef2ff]/30 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1e293b] truncate">
                    {venta.cliente || 'Mostrador'}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    {formatDate(venta.fecha)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getStatusBadge(venta.estado)} size="sm">
                    {venta.estado}
                  </Badge>
                  <p className="text-sm font-semibold text-[#10b981]">
                    {formatCurrency(venta.total)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
