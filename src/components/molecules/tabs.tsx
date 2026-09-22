'use client';

import { useState } from 'react';

interface TabsProps { labels: string[]; }

export function Tabs({ labels }: TabsProps) {
  const [active, setActive] = useState(0);
  return <div aria-label="Navigasi tab" className="inline-flex rounded-xl bg-[var(--surface-muted)] p-1" role="tablist">{labels.map((label, index) => <button aria-selected={active === index} className={`rounded-lg px-3 py-2 text-sm font-semibold ${active === index ? 'ui-surface ui-heading shadow-sm' : 'ui-copy'}`} key={label} onClick={() => setActive(index)} role="tab" type="button">{label}</button>)}</div>;
}
