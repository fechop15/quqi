'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-[#1e293b]"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5
            text-sm text-[#1e293b] placeholder:text-[#94a3b8]
            transition-all duration-200 resize-none
            focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8fafc]
            ${
              error
                ? 'border-danger focus:border-danger focus:ring-[#fee2e2]'
                : 'border-border-main focus:border-primary focus:ring-[#eef2ff]'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-[#ef4444]">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-[#94a3b8]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
