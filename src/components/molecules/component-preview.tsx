import type { ReactNode } from 'react';
import { Badge } from '@/components/atoms/badge';

interface ComponentPreviewProps { name: string; description: string; children: ReactNode; category?: string; }

export function ComponentPreview({ category = 'ATOMS', children, description, name }: ComponentPreviewProps) {
  return <article className="ui-card min-h-56 rounded-2xl p-6"><Badge className="ui-action-soft border-0 px-2 py-0.5 text-[11px]" tone="neutral">{category}</Badge><h3 className="ui-heading mt-4 text-xl font-bold tracking-tight">{name}</h3><p className="ui-copy mt-1 min-h-10 text-sm leading-6">{description}</p><div className="mt-6 flex flex-wrap items-center gap-3">{children}</div></article>;
}
