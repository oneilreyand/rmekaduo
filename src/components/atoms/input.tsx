import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => <input ref={ref} className={`ui-input h-10 w-full rounded-xl border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />,
);

Input.displayName = 'Input';
