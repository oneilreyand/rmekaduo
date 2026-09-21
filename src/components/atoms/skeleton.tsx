interface SkeletonProps { className?: string; }

export function Skeleton({ className = '' }: SkeletonProps) {
  return <span aria-label="Memuat" className={`block animate-pulse rounded-lg bg-stone-200 ${className}`} role="status" />;
}
