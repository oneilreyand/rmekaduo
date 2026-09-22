import { ShieldAlert, AlertTriangle } from 'lucide-react';
import type { Patient } from '@/types/rme';

export interface PatientBannerProps {
  patient: Patient;
  className?: string;
}

export function PatientBanner({ patient, className = '' }: PatientBannerProps) {
  const severeAllergy = patient.allergies.find((a) => a.severity === 'BERAT');
  const primaryAllergy = severeAllergy || patient.allergies[0];
  const initials = patient.name
    .replace(/^(Tn\.|Ny\.|An\.)\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div
      className={`ui-card rounded-2xl p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Patient Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="ui-action-soft grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold">
              {patient.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={patient.avatarUrl}
                  alt={patient.name}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              ) : initials}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="ui-heading text-base font-extrabold tracking-tight">
                {patient.name}
              </h2>
              <span className="ui-copy text-xs font-semibold">
                ({patient.age} th / {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
              </span>
            </div>
            <div className="ui-copy mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-mono">
              <span>No. RM: <strong className="ui-heading">{patient.mrn}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Data demonstrasi lokal</span>
            </div>
          </div>

        </div>

        {/* Patient Safety & BPJS Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="ui-status-neutral flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            <span>Penjaminan belum diverifikasi</span>
          </div>

          {/* Critical Allergy Badge (Pulsing Red) */}
          {primaryAllergy && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-red-600 bg-red-600 px-3.5 py-1 text-xs font-bold text-white"
              role="alert"
            >
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span>ALERGI: {primaryAllergy.substance.toUpperCase()} ({primaryAllergy.severity})</span>
            </div>
          )}

          {/* Fall Risk Badge (Amber) */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
              patient.fallRisk === 'TINGGI'
                ? 'ui-status-warning-solid'
                : 'ui-status-warning'
            }`}
          >
            <AlertTriangle className={`h-4 w-4 ${patient.fallRisk === 'TINGGI' ? 'text-white' : 'ui-text-warning'}`} aria-hidden="true" />
            <span>RISIKO JATUH: {patient.fallRisk}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
