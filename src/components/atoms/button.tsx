import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#006bbb] text-white hover:bg-[#005a9f] focus-visible:ring-[#30a0e0]',
  secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200 focus-visible:ring-stone-300',
  ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-950 focus-visible:ring-stone-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
};

export function Button({ children, className = '', disabled, isLoading = false, size = 'md', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} disabled={disabled || isLoading} type={type} {...props}>
      {isLoading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
