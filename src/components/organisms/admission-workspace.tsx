'use client';

import { Printer } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { QueueNumberBadge } from '@/components/atoms/queue-number-badge';
import { PatientSearchAutocomplete } from '@/components/molecules/patient-search-autocomplete';
import { Toast, type ToastTone } from '@/components/molecules/toast';
import { usePatientJourney, type RegisterPatientPayload } from '@/context/patient-journey-context';
import type { Patient } from '@/types/rme';

const initialForm: RegisterPatientPayload = {
  name: '', nik: '', age: 30, gender: 'L', mrn: '', phone: '', paymentType: 'UMUM', bpjsNumber: '',
  bloodType: 'O+', allergySubstance: '', allergySeverity: 'SEDANG', allergyReaction: '', fallRisk: 'RENDAH',
  poliCode: 'POLI_UMUM', poliName: 'Poli Umum', doctorId: 'doc-demo', doctorName: 'Dokter Contoh',
};

export function AdmissionWorkspace() {
  const { encounters, registerPatient } = usePatientJourney();
  const [form, setForm] = useState(initialForm);
  const [ticket, setTicket] = useState<{ number: string; name: string } | null>(null);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const set = <K extends keyof RegisterPatientPayload>(key: K, value: RegisterPatientPayload[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const showToast = (tone: ToastTone, message: string) => { setToast({ tone, message }); window.setTimeout(() => setToast(null), 3200); };

  const selectPatient = (patient: Patient) => {
    setForm((previous) => ({ ...previous, name: patient.name, nik: patient.nik, age: patient.age, gender: patient.gender, mrn: patient.mrn, bloodType: patient.bloodType, allergySubstance: patient.allergies[0]?.substance || '', allergySeverity: patient.allergies[0]?.severity || 'SEDANG', allergyReaction: patient.allergies[0]?.reaction || '', fallRisk: patient.fallRisk }));
    showToast('info', 'Data contoh dimuat ke formulir lokal.');
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.nik.trim()) { showToast('error', 'Isi nama dan ID pasien demo terlebih dahulu.'); return; }
    const encounter = registerPatient(form);
    setTicket({ number: encounter.queueNumber, name: encounter.patient?.name || form.name });
    showToast('success', `Antrean demo ${encounter.queueNumber} dibuat di sesi browser ini.`);
  };

  return (
    <main className="ui-workspace">
      <div className="ui-workspace-inner space-y-5">
        <header className="ui-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <p className="ui-eyebrow text-xs font-bold">ADMISI</p>
            <h1 className="ui-workspace-heading mt-1">Pendaftaran pasien</h1>
            <p className="ui-copy mt-1 text-sm">Buat antrean contoh untuk meninjau alur antarmuka.</p>
          </div>
          <p className="ui-demo-note px-3 py-2">Mode demonstrasi · tidak memverifikasi BPJS atau SATUSEHAT</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-5">
            <div className="ui-card rounded-2xl p-5">
              <label className="ui-label mb-2">Cari data contoh</label>
              <PatientSearchAutocomplete patients={encounters.flatMap((encounter) => encounter.patient ? [encounter.patient] : [])} onSelectPatient={selectPatient} onNewPatient={() => { setForm(initialForm); setTicket(null); }} />
            </div>

            <form onSubmit={submit} className="ui-card space-y-5 rounded-2xl p-5">
              <div>
                <h2 className="ui-section-title">Formulir pendaftaran demo</h2>
                <p className="ui-copy mt-1 text-xs">Nilai tidak disimpan di server atau dikirim ke pihak ketiga.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="ui-label">Nama contoh<input required className="ui-field mt-1.5" value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Pasien contoh baru" /></label>
                <label className="ui-label">ID pasien demo<input required className="ui-field mt-1.5" value={form.nik} onChange={(event) => set('nik', event.target.value)} placeholder="ID-DEMO-05" /></label>
                <label className="ui-label">Usia<input type="number" min="0" className="ui-field mt-1.5" value={form.age} onChange={(event) => set('age', Number(event.target.value))} /></label>
                <label className="ui-label">Jenis kelamin<select className="ui-field mt-1.5" value={form.gender} onChange={(event) => set('gender', event.target.value as 'L' | 'P')}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
                <label className="ui-label">Poli<select className="ui-field mt-1.5" value={form.poliCode} onChange={(event) => setForm((previous) => ({ ...previous, poliCode: event.target.value, poliName: event.target.options[event.target.selectedIndex].text }))}><option value="POLI_UMUM">Poli Umum</option><option value="POLI_GIGI">Poli Gigi</option></select></label>
                <label className="ui-label">Penjamin<select className="ui-field mt-1.5" value={form.paymentType} onChange={(event) => set('paymentType', event.target.value as 'BPJS' | 'UMUM')}><option value="UMUM">Umum</option><option value="BPJS">BPJS — simulasi</option></select></label>
              </div>
              <label className="ui-label">Catatan alergi (opsional)<input className="ui-field mt-1.5" value={form.allergySubstance} onChange={(event) => set('allergySubstance', event.target.value)} placeholder="Contoh: tidak ada" /></label>
              <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => { setForm(initialForm); setTicket(null); }}>Bersihkan</Button><Button type="submit">Buat antrean demo</Button></div>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="ui-card rounded-2xl p-5">
              <h2 className="ui-section-title">Antrean saat ini</h2>
              <div className="mt-3 space-y-2">{encounters.slice(0, 5).map((encounter) => <div className="ui-surface-subtle flex items-center gap-3 rounded-xl border p-3" key={encounter.id}><QueueNumberBadge number={encounter.queueNumber} status={encounter.status} size="sm" /><span className="ui-copy truncate text-xs">{encounter.patient?.name || 'Pasien contoh'}</span></div>)}</div>
            </section>
            <section className="ui-card rounded-2xl p-5 text-center">
              {ticket ? <><QueueNumberBadge number={ticket.number} status="IN_QUEUE" size="xl" /><h2 className="ui-heading mt-3 text-sm font-bold">{ticket.name}</h2><p className="ui-copy mt-1 text-xs">Karcis ini hanya preview lokal.</p><Button variant="secondary" size="sm" className="mt-4" onClick={() => window.print()}><Printer aria-hidden="true" className="h-3.5 w-3.5" />Cetak preview</Button></> : <p className="ui-copy text-sm">Preview antrean akan tampil di sini.</p>}
            </section>
          </aside>
        </div>
      </div>
      {toast ? <div className="fixed bottom-5 right-5 z-50"><Toast tone={toast.tone} message={toast.message} /></div> : null}
    </main>
  );
}
