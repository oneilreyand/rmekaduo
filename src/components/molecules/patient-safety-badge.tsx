import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface PatientSafetyBadgeProps {
  type: 'allergy' | 'fall-risk' | 'bpjs-status';
  label: string;
  severity?: 'RINGAN' | 'SEDANG' | 'BERAT' | 'TINGGI' | 'AKTIF' | 'NONAKTIF';
  className?: string;
}

export function PatientSafetyBadge({
  type,
  label,
  severity = 'SEDANG',
  className = '',
}: PatientSafetyBadgeProps) {
  if (type === 'allergy') {
    const isSevere = severity === 'BERAT';
    return (
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-sm transition-all ${
          isSevere
            ? 'ui-status-danger-solid border'
            : 'ui-status-danger border'
        } ${className}`}
      >
        <ShieldAlert className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  if (type === 'fall-risk') {
    const isHigh = severity === 'BERAT' || severity === 'TINGGI';
    return (
      <span
        role="status"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide border shadow-sm ${
          isHigh
            ? 'ui-status-warning-solid border'
            : 'ui-status-warning border'
        } ${className}`}
      >
        <AlertTriangle className="ui-text-warning h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  // BPJS status
  const isActive = severity === 'AKTIF';
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold border ${
        isActive
          ? 'ui-status-success'
          : 'ui-status-neutral'
      } ${className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-[var(--border-strong)]'
        }`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
