'use client';

interface CheckboxProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ checked, label, onChange }: CheckboxProps) {
  return <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-700"><input checked={checked} className="h-4 w-4 rounded border-stone-300 text-[#006bbb] focus:ring-[#30a0e0]" onChange={(event) => onChange(event.target.checked)} type="checkbox" /><span>{label}</span></label>;
}
