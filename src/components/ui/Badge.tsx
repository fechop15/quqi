'use client';

import { HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', dot: 'bg-[#64748b]' },
  primary: { bg: 'bg-[#eef2ff]', text: 'text-[#4f46e5]', dot: 'bg-[#6366f1]' },
  success: { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]', dot: 'bg-[#10b981]' },
  warning: { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]', dot: 'bg-[#f59e0b]' },
  danger: { bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]', dot: 'bg-[#ef4444]' },
  info: { bg: 'bg-[#eff6ff]', text: 'text-[#2563eb]', dot: 'bg-[#3b82f6]' },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          transition-colors duration-200
          ${styles.bg} ${styles.text}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
