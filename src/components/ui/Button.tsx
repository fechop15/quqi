'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#6366f1] text-white hover:bg-[#4f46e5] active:bg-[#4338ca] shadow-sm',
  secondary: 'bg-[#eef2ff] text-[#4f46e5] hover:bg-[#e0e7ff] active:bg-[#c7d2fe]',
  outline: 'border-2 border-primary text-[#4f46e5] hover:bg-[#eef2ff] active:bg-[#e0e7ff]',
  ghost: 'text-[#4f46e5] hover:bg-[#eef2ff] active:bg-[#e0e7ff]',
  danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] shadow-sm',
  success: 'bg-[#10b981] text-white hover:bg-[#059669] active:bg-[#047857] shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-all duration-200 ease-out
          focus-ring cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
