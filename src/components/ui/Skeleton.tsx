'use client';

import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'circular' ? height ?? 40 : '100%'),
    height: height ?? (variant === 'text' ? 16 : 40),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

interface SkeletonCardProps {
  showAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({ showAvatar = true, lines = 3 }: SkeletonCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="flex items-center gap-4 mb-4">
        {showAvatar && <Skeleton variant="circular" width={48} height={48} />}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? '70%' : '100%'} />
        ))}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="border-b border-border bg-gray-50 px-6 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" height={14} className="flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  variant="text"
                  height={14}
                  className="flex-1"
                  width={colIndex === 0 ? '80%' : '60%'}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
