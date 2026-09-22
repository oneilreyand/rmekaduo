'use client';

import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

import type { Patient } from '@/types/rme';

interface PatientSearchAutocompleteProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNewPatient: () => void;
}

export function PatientSearchAutocomplete({ patients, onSelectPatient, onNewPatient }: PatientSearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const matchingPatients = query.trim()
    ? patients.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase()) || patient.mrn.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="relative">
      <Search aria-hidden="true" className="ui-copy pointer-events-none absolute left-3 top-3 h-4 w-4" />
      <input
        className="ui-field h-10 pl-10 pr-28 text-xs"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari data contoh berdasarkan nama atau ID demo"
        aria-label="Cari data pasien contoh"
      />
      <button type="button" onClick={onNewPatient} className="ui-action absolute right-1.5 top-1.5 inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[11px] font-bold">
        <UserPlus aria-hidden="true" className="h-3.5 w-3.5" /> Baru
      </button>
      {query.trim() ? (
        <div className="ui-card absolute inset-x-0 top-12 z-20 max-h-56 overflow-auto rounded-xl p-1.5 shadow-lg">
          {matchingPatients.length ? matchingPatients.map((patient) => (
            <button key={patient.id} type="button" onClick={() => { onSelectPatient(patient); setQuery(''); }} className="ui-ghost block w-full rounded-lg px-3 py-2 text-left text-xs">
              <span className="ui-heading block font-bold">{patient.name}</span>
              <span className="ui-copy">{patient.mrn} · data demonstrasi</span>
            </button>
          )) : <p className="ui-copy px-3 py-2 text-xs">Data contoh tidak ditemukan.</p>}
        </div>
      ) : null}
    </div>
  );
}
