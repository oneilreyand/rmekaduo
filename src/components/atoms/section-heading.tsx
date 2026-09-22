import type { ReactNode } from 'react';

interface SectionHeadingProps { eyebrow?: string; title: string; children?: ReactNode; }

export function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return <div className="space-y-1">{eyebrow && <p className="ui-eyebrow text-xs font-bold uppercase tracking-[0.06em]">{eyebrow}</p>}<h2 className="ui-heading text-xl font-bold tracking-tight">{title}</h2>{children && <div className="ui-copy max-w-2xl text-sm leading-6">{children}</div>}</div>;
}
