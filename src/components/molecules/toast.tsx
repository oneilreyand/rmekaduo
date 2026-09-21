import { CheckCircle2, CircleAlert, Info } from 'lucide-react';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';
interface ToastProps { message: string; tone: ToastTone; }
const styles = { success: ['bg-emerald-50 border-emerald-200 text-emerald-900', CheckCircle2], info: ['bg-sky-50 border-sky-200 text-sky-900', Info], warning: ['bg-amber-50 border-amber-200 text-amber-900', CircleAlert], error: ['bg-rose-50 border-rose-200 text-rose-900', CircleAlert] } as const;

export function Toast({ message, tone }: ToastProps) {
  const [className, Icon] = styles[tone];
  return <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm ${className}`}><Icon className="h-4 w-4" />{message}</div>;
}
