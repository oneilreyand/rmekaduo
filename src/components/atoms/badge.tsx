import type { HTMLAttributes, ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-stone-300 bg-stone-50 text-stone-700',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-300 bg-amber-50 text-amber-800',
  danger: 'border-rose-300 bg-rose-50 text-rose-800',
  info: 'border-sky-300 bg-sky-50 text-sky-800',
};

export function Badge({ children, className = '', tone = 'neutral', ...props }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`} {...props}>{children}</span>;
}
