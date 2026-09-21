import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => <input ref={ref} className={`h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-[#006bbb] focus:outline-none focus:ring-2 focus:ring-[#30a0e0]/35 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />,
);

Input.displayName = 'Input';
