import React from 'react';

export interface DosagePreset {
  label: string;
  value: string;
}

export interface SmartDosageChipsProps {
  onSelect: (value: string) => void;
  className?: string;
}

const defaultDosages: DosagePreset[] = [
  { label: '3x1', value: '3 x 1 tablet sehari' },
  { label: '2x1', value: '2 x 1 tablet sehari' },
  { label: '1x1 malam', value: '1 x 1 tablet malam hari' },
  { label: 'Sesudah Makan', value: 'sesudah makan (p.c.)' },
  { label: 'Sebelum Makan', value: 'sebelum makan (a.c.)' },
  { label: '10 Tab', value: '10 tablet' },
  { label: 'Bila Perlu (p.r.n)', value: 'bila demam/nyeri (p.r.n)' },
];

export function SmartDosageChips({
  onSelect,
  className = '',
}: SmartDosageChipsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="ui-copy mr-1 text-[11px] font-semibold">
        Cepat:
      </span>
      {defaultDosages.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.value)}
          className="ui-chip rounded-lg px-2 py-0.5 text-xs font-medium transition-all active:scale-95"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
