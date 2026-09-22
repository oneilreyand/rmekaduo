'use client';

interface CheckboxProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ checked, label, onChange }: CheckboxProps) {
  return <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--text)]"><input checked={checked} className="h-4 w-4 rounded border-[var(--border-strong)]" onChange={(event) => onChange(event.target.checked)} style={{ accentColor: 'var(--action)' }} type="checkbox" /><span>{label}</span></label>;
}
