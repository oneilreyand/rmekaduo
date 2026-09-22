import type { HTMLAttributes, ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'allergy' | 'fallRisk' | 'bpjsActive' | 'normal';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'ui-status-neutral',
  success: 'ui-status-success',
  warning: 'ui-status-warning',
  danger: 'ui-status-danger',
  info: 'border-[var(--action)] bg-[var(--action-soft)] text-[var(--action)]',
  allergy: 'ui-status-danger-solid',
  fallRisk: 'ui-status-warning font-bold',
  bpjsActive: 'ui-status-success font-semibold',
  normal: 'ui-status-success',
};

export function Badge({ children, className = '', tone = 'neutral', ...props }: BadgeProps) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors ${toneClasses[tone]} ${className}`} {...props}>{children}</span>;
}
