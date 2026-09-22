import React from 'react';

export interface KbdShortcutProps {
  children: React.ReactNode;
  className?: string;
}

export function KbdShortcut({ children, className = '' }: KbdShortcutProps) {
  return (
    <kbd
      className={`ui-kbd inline-flex items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold shadow-xs ${className}`}
    >
      {children}
    </kbd>
  );
}
