import React from 'react';

export interface InteractivePainSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function InteractivePainSlider({
  value,
  onChange,
  className = '',
}: InteractivePainSliderProps) {
  const getFaceEmoji = (val: number) => {
    if (val === 0) return '😊';
    if (val <= 3) return '🙂';
    if (val <= 6) return '😐';
    if (val <= 8) return '😣';
    return '😭';
  };

  const getPainCategory = (val: number) => {
    if (val === 0) return 'Tidak Nyeri';
    if (val <= 3) return 'Nyeri Ringan';
    if (val <= 6) return 'Nyeri Sedang';
    if (val <= 8) return 'Nyeri Berat';
    return 'Tak Tertahankan';
  };

  return (
    <div className={`ui-card rounded-xl p-3.5 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="ui-heading text-xs font-bold">
            Skala Nyeri (NRS / Wong-Baker)
          </span>
          <p className="ui-copy text-[11px]">
            {getPainCategory(value)}
          </p>
        </div>
        <div className="ui-action-soft flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold">
          <span className="text-sm" role="img" aria-label="Ekspresi nyeri">
            {getFaceEmoji(value)}
          </span>
          <span>{value} / 10</span>
        </div>
      </div>

      <div className="relative py-1">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Skala Nyeri Pasien"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-valuetext={`${value} dari 10: ${getPainCategory(value)}`}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-muted)] accent-[var(--action)]"
        />
      </div>

      <div className="ui-copy mt-1 flex justify-between text-[10px] font-medium">
        <span>0 (Bebas)</span>
        <span>5 (Sedang)</span>
        <span>10 (Parah)</span>
      </div>
    </div>
  );
}
