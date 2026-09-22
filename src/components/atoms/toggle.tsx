'use client';

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, label, onChange, disabled = false, className = '' }: ToggleProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`ui-toggle relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-[background-color,border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'ui-toggle-on' : ''}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          aria-hidden="true"
          className={`ui-toggle-thumb block h-6 w-6 rounded-full transition-transform duration-200 ease-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
      <span className="ui-heading text-sm font-medium">{label}</span>
    </div>
  );
}
