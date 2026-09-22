import { CheckCircle2, CircleAlert, Info } from 'lucide-react';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';
interface ToastProps { message: string; tone: ToastTone; }
const styles = { success: ['ui-status-success', CheckCircle2], info: ['bg-[var(--action-soft)] border-[var(--action)] text-[var(--action)]', Info], warning: ['ui-status-warning', CircleAlert], error: ['ui-status-danger', CircleAlert] } as const;

export function Toast({ message, tone }: ToastProps) {
  const [className, Icon] = styles[tone];
  return <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm ${className}`}><Icon className="h-4 w-4" />{message}</div>;
}
