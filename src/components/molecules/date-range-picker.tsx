'use client';

import { CalendarDays, X } from 'lucide-react';
import { useState } from 'react';

export function DateRangePicker() {
  const [range, setRange] = useState('1 Agu 2026 – 13 Agu 2026');
  return <div className="flex items-center gap-2"><button aria-label="Pilih rentang tanggal" className="ui-input inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium" onClick={() => setRange('Hari ini')} type="button"><CalendarDays className="h-4 w-4" />{range}</button><button aria-label="Hapus rentang tanggal" className="ui-icon-button grid h-9 w-9 place-items-center rounded-lg" onClick={() => setRange('Pilih rentang tanggal')} type="button"><X className="h-4 w-4" /></button></div>;
}
