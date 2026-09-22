import { Search } from 'lucide-react';
import { Input } from '@/components/atoms/input';

interface SearchFieldProps { value: string; onChange: (value: string) => void; }

export function SearchField({ value, onChange }: SearchFieldProps) {
  return <label className="relative block"><span className="sr-only">Cari komponen UI</span><Search aria-hidden="true" className="ui-copy pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><Input className="h-9 pl-9 pr-16 text-xs" onChange={(event) => onChange(event.target.value)} placeholder="Cari komponen, token, atau pola…" value={value} /><kbd className="ui-kbd pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded px-1.5 py-0.5 font-mono text-[10px] sm:block">⌘K</kbd></label>;
}
