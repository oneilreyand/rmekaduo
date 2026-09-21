import type { ReactNode } from 'react';

interface SectionHeadingProps { eyebrow?: string; title: string; children?: ReactNode; }

export function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return <div className="space-y-1">{eyebrow && <p className="text-xs font-bold uppercase tracking-[0.06em] text-stone-400">{eyebrow}</p>}<h2 className="text-xl font-bold tracking-tight text-[#313866]">{title}</h2>{children && <div className="max-w-2xl text-sm leading-6 text-stone-500">{children}</div>}</div>;
}
