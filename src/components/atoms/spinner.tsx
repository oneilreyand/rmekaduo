interface SpinnerProps { size?: 'sm' | 'md' | 'lg' | 'xl'; }

const sizeClasses = { sm: 'h-5 w-5 border-2', md: 'h-7 w-7 border-[3px]', lg: 'h-10 w-10 border-4', xl: 'h-14 w-14 border-[5px]' };

export function Spinner({ size = 'md' }: SpinnerProps) {
  return <span aria-label="Memuat" className={`inline-block animate-spin rounded-full border-[var(--action)] border-r-[var(--surface-muted)] ${sizeClasses[size]}`} role="status" />;
}
