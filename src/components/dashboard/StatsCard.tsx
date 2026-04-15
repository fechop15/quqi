'use client';

type StatVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: StatVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const variantStyles: Record<StatVariant, { iconBg: string; labelColor: string }> = {
  primary: { iconBg: 'bg-[#6366f1] text-white', labelColor: 'text-[#6366f1]' },
  success: { iconBg: 'bg-[#10b981] text-white', labelColor: 'text-[#10b981]' },
  warning: { iconBg: 'bg-[#f59e0b] text-white', labelColor: 'text-[#f59e0b]' },
  danger: { iconBg: 'bg-[#ef4444] text-white', labelColor: 'text-[#ef4444]' },
  neutral: { iconBg: 'bg-[#64748b] text-white', labelColor: 'text-[#64748b]' },
};

export function StatsCard({
  label,
  value,
  icon,
  variant = 'primary',
  trend,
  className = '',
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm border border-border-main hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={`text-sm font-medium ${styles.labelColor}`}>
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1e293b]">
            {value}
          </p>

          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`inline-flex items-center text-xs font-medium ${
                  trend.isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-[#94a3b8]">vs mes anterior</span>
            </div>
          )}
        </div>

        <div className={`flex items-center justify-center rounded-xl p-3 ${styles.iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
