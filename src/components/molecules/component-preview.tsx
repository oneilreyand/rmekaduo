import type { ReactNode } from 'react';
import { Badge } from '@/components/atoms/badge';

interface ComponentPreviewProps { name: string; description: string; children: ReactNode; category?: string; }

export function ComponentPreview({ category = 'ATOMS', children, description, name }: ComponentPreviewProps) {
  return <article className="min-h-56 rounded-2xl border border-stone-200 bg-white p-7 shadow-sm"><Badge className="border-0 bg-[#ffe3b3] px-2 py-0.5 text-[11px] text-[#0f172a]" tone="neutral">{category}</Badge><h3 className="mt-4 text-xl font-bold tracking-tight text-[#0f172a]">{name}</h3><p className="mt-1 min-h-10 text-sm leading-6 text-stone-500">{description}</p><div className="mt-6 flex flex-wrap items-center gap-3">{children}</div></article>;
}
