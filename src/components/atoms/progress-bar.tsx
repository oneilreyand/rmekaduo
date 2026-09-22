interface ProgressBarProps { label: string; value: number; tone?: 'primary' | 'warning' | 'danger'; }

const toneClasses = { primary: 'bg-[var(--action)]', warning: 'bg-amber-500', danger: 'bg-rose-600' };

export function ProgressBar({ label, tone = 'primary', value }: ProgressBarProps) {
  return <div className="w-full space-y-1.5"><div className="flex justify-between gap-3 text-sm font-semibold text-[var(--text-muted)]"><span>{label}</span><span>{value}%</span></div><div aria-label={`${label}: ${value}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={value} className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar"><div className={`h-full rounded-full ${toneClasses[tone]}`} style={{ width: `${value}%` }} /></div></div>;
}
