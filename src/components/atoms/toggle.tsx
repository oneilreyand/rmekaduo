'use client';

interface ToggleProps { checked: boolean; label: string; onChange: (checked: boolean) => void; }

export function Toggle({ checked, label, onChange }: ToggleProps) {
  return <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-stone-700"><button aria-checked={checked} aria-label={label} className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30a0e0] ${checked ? 'bg-[#006bbb]' : 'bg-stone-200'}`} onClick={() => onChange(!checked)} role="switch" type="button"><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>{label}</label>;
}
