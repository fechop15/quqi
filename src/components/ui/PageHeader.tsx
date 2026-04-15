'use client';

import { ReactNode } from 'react';
import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#6366f1]/10 text-[#6366f1]">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-[#64748b]">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
