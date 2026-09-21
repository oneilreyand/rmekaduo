import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface HeaderMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> { children: ReactNode; isActive?: boolean; }

export function HeaderMenuItem({ children, className = '', isActive = false, ...props }: HeaderMenuItemProps) {
  return <button className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${isActive ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${className}`} type="button" {...props}>{children}</button>;
}
