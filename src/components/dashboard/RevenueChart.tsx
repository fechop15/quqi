'use client';
import { formatCurrency } from '@/lib/utils';

interface ChartData {
  mes: string;
  ingresos: number;
  egresos: number;
  balance: number;
}

interface RevenueChartProps {
  data: ChartData[];
  title?: string;
}

export function RevenueChart({ data, title = 'Ingresos vs Egresos' }: RevenueChartProps) {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.ingresos, d.egresos)),
    1
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-border-main overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1e293b]">{title}</h3>
      </div>

      <div className="flex items-center justify-end gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#10b981]" />
          <span className="text-sm text-[#475569]">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="text-sm text-[#475569]">Egresos</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-36">
        {data.map((item, index) => {
          const incomeHeight = (item.ingresos / maxValue) * 100;
          const expenseHeight = (item.egresos / maxValue) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-36">
                <div
                  className="w-6 bg-[#10b981]/80 rounded-t-md transition-all duration-500 hover:bg-[#10b981] cursor-pointer"
                  style={{ height: `${incomeHeight}%` }}
                  title={`Ingresos: ${formatCurrency(item.ingresos)}`}
                />
                <div
                  className="w-6 bg-[#ef4444]/80 rounded-t-md transition-all duration-500 hover:bg-[#ef4444] cursor-pointer"
                  style={{ height: `${expenseHeight}%` }}
                  title={`Egresos: ${formatCurrency(item.egresos)}`}
                />
              </div>
              <span className="text-xs text-[#94a3b8] capitalize">{item.mes}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
