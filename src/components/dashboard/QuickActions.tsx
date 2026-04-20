'use client';
import Link from 'next/link';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'danger';
  target?: '_blank';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

const variantStyles = {
  primary: 'bg-[#eef2ff] text-[#4f46e5] hover:bg-[#e0e7ff] border-border-light',
  success: 'bg-[#ecfdf5] text-[#059669] hover:bg-[#d1fae5] border-success-light',
  warning: 'bg-[#fffbeb] text-[#d97706] hover:bg-[#fef3c7] border-warning-light',
  danger: 'bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] border-danger-light',
};

export function QuickActions({ actions, title = 'Acciones rápidas' }: QuickActionsProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-border-main overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1e293b]">{title}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="block"
            target={action.target}
            rel={action.target === '_blank' ? 'noopener noreferrer' : undefined}
          >
            <div
              className={`
                flex items-center gap-3 rounded-lg px-4 py-3
                border transition-all duration-200 cursor-pointer
                hover:shadow-sm active:scale-[0.98]
                ${variantStyles[action.variant]}
              `}
            >
              {action.icon}
              <span className="font-medium">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
