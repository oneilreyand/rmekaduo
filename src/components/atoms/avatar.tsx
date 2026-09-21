interface AvatarProps { initials: string; size?: 'sm' | 'md' | 'lg'; }
const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };

export function Avatar({ initials, size = 'md' }: AvatarProps) {
  return <span aria-label={`Avatar ${initials}`} className={`grid place-items-center rounded-full bg-[#39aea9] font-bold text-[#0f172a] ring-2 ring-white ${sizeClasses[size]}`}>{initials}</span>;
}
