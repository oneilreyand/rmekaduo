'use client';

import { AlertTriangle, HeartPulse } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button';
import { QueueTicketCard } from '@/components/molecules/queue-ticket-card';
import { InteractivePainSlider } from '@/components/molecules/interactive-pain-slider';
import { Toast, type ToastTone } from '@/components/molecules/toast';
import { usePatientJourney } from '@/context/patient-journey-context';
import type { VitalSigns } from '@/types/rme';

const emptyVitals: VitalSigns = { systolic: 120, diastolic: 80, heartRate: 80, respiratoryRate: 18, temperature: 36.6, spo2: 98, weightKg: 60, heightCm: 165, painScale: 0 };

export function TriageWorkspace() {
  const { encounters, activeTriageId, setActiveTriageId, saveTriage, callToDoctor } = usePatientJourney();
  const waiting = encounters.filter((encounter) => ['BOOKED', 'ARRIVED', 'IN_QUEUE'].includes(encounter.status));
  const active = encounters.find((encounter) => encounter.id === activeTriageId) || waiting[0] || null;
  const [vitals, setVitals] = useState<VitalSigns>(emptyVitals);
  const [fallRisk, setFallRisk] = useState<'RENDAH' | 'SEDANG' | 'TINGGI'>('RENDAH');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const showToast = (tone: ToastTone, message: string) => { setToast({ tone, message }); window.setTimeout(() => setToast(null), 3200); };

  useEffect(() => {
    if (!active) return;
    setVitals(active.vitals || emptyVitals);
    setFallRisk(active.patient?.fallRisk || 'RENDAH');
    setNotes(active.triageNotes || '');
  }, [active?.id]);

  const save = () => {
    if (!active) return;
    saveTriage(active.id, vitals, fallRisk, notes);
    callToDoctor(active.id);
    showToast('success', 'Pengkajian contoh disimpan di sesi browser dan dipindahkan ke antrean konsultasi demo.');
  };

  return (
    <main className="ui-workspace"><div className="ui-workspace-inner space-y-5">
      <header className="ui-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"><div><p className="ui-eyebrow text-xs font-bold">TRIASE</p><h1 className="ui-workspace-heading mt-1">Pengkajian awal</h1><p className="ui-copy mt-1 text-sm">Tanda vital dan keselamatan pasien dalam mode demonstrasi.</p></div><p className="ui-demo-note px-3 py-2">Tidak menggantikan pengkajian atau otorisasi klinis.</p></header>
      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="ui-card rounded-2xl p-4"><h2 className="ui-section-title">Antrean demonstrasi</h2><div className="mt-3 space-y-2">{waiting.length ? waiting.map((encounter) => <QueueTicketCard key={encounter.id} encounter={encounter} isCalling={active?.id === encounter.id} actionLabel="Pilih" onAction={() => setActiveTriageId(encounter.id)} />) : <p className="ui-copy text-sm">Tidak ada antrean.</p>}</div></aside>
        <section className="ui-card rounded-2xl p-5">{active ? <div className="space-y-5"><div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4"><div><h2 className="ui-heading text-base font-bold">{active.patient?.name || 'Pasien contoh'}</h2><p className="ui-copy mt-1 text-xs">{active.queueNumber} · {active.poliName} · data lokal</p></div>{active.patient?.allergies?.length ? <p className="ui-status-danger inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold"><AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />Alergi: {active.patient.allergies.map((item) => item.substance).join(', ')}</p> : <p className="ui-status-neutral rounded-full border px-3 py-1 text-xs font-bold">Riwayat alergi belum diverifikasi</p>}</div>
          <div><h3 className="ui-section-title flex items-center gap-2"><HeartPulse aria-hidden="true" className="h-4 w-4" />Tanda vital</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([
            ['Tekanan sistolik', 'systolic'], ['Tekanan diastolik', 'diastolic'], ['Denyut nadi', 'heartRate'], ['Laju napas', 'respiratoryRate'], ['Suhu', 'temperature'], ['SpO₂', 'spo2'], ['Berat badan', 'weightKg'], ['Tinggi badan', 'heightCm'],
          ] as const).map(([label, key]) => <label key={key} className="ui-label">{label}<input type="number" className="ui-field mt-1.5" value={vitals[key]} onChange={(event) => setVitals({ ...vitals, [key]: Number(event.target.value) })} /></label>)}</div></div>
          <div className="grid gap-4 lg:grid-cols-2"><InteractivePainSlider value={vitals.painScale} onChange={(painScale) => setVitals({ ...vitals, painScale })} /><div className="ui-surface-subtle rounded-xl border p-4"><label className="ui-label">Risiko jatuh<select className="ui-field mt-1.5" value={fallRisk} onChange={(event) => setFallRisk(event.target.value as typeof fallRisk)}><option value="RENDAH">Rendah</option><option value="SEDANG">Sedang</option><option value="TINGGI">Tinggi</option></select></label><label className="ui-label mt-4">Catatan contoh<textarea className="ui-field mt-1.5 min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div></div>
          <div className="flex justify-end"><Button onClick={save}>Simpan pengkajian demo</Button></div>
        </div> : <p className="ui-copy">Pilih antrean untuk mulai.</p>}</section>
      </div>
    </div>{toast ? <div className="fixed bottom-5 right-5 z-50"><Toast tone={toast.tone} message={toast.message} /></div> : null}</main>
  );
}
