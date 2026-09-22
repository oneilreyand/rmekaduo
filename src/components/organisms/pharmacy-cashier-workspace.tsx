'use client';

import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { QueueTicketCard } from '@/components/molecules/queue-ticket-card';
import { Toast, type ToastTone } from '@/components/molecules/toast';
import { usePatientJourney } from '@/context/patient-journey-context';

type WorkspaceTab = 'farmasi' | 'kasir';

export function PharmacyCashierWorkspace() {
  const { encounters, dispenseMedication, finalizeBilling } = usePatientJourney();
  const candidates = encounters.filter((encounter) => ['PHARMACY_QUEUE', 'COMPLETED'].includes(encounter.status));
  const [selectedId, setSelectedId] = useState<string | null>(candidates[0]?.id || null);
  const [tab, setTab] = useState<WorkspaceTab>('farmasi');
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const selected = candidates.find((encounter) => encounter.id === selectedId) || candidates[0] || null;
  const showToast = (tone: ToastTone, message: string) => { setToast({ tone, message }); window.setTimeout(() => setToast(null), 3200); };

  const handover = () => { if (!selected) return; dispenseMedication(selected.id); setTab('kasir'); showToast('success', 'Status penyerahan obat diperbarui secara lokal untuk demo.'); };
  const complete = () => { if (!selected) return; finalizeBilling(selected.id); showToast('success', 'Sesi demo ditandai selesai secara lokal. Tidak ada TTE, lock rekam medis, atau sinkronisasi eksternal.'); };

  return (
    <main className="ui-workspace"><div className="ui-workspace-inner space-y-5">
      <header className="ui-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"><div><p className="ui-eyebrow text-xs font-bold">FARMASI & KASIR</p><h1 className="ui-workspace-heading mt-1">Penyelesaian pelayanan</h1><p className="ui-copy mt-1 text-sm">Review resep dan ringkasan biaya dalam mode demonstrasi.</p></div><p className="ui-demo-note px-3 py-2">Tidak tersambung ke KFA, BPJS, TTE, atau SATUSEHAT</p></header>
      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]"><aside className="ui-card rounded-2xl p-4"><h2 className="ui-section-title">Antrean</h2><div className="mt-3 space-y-2">{candidates.length ? candidates.map((encounter) => <QueueTicketCard key={encounter.id} encounter={encounter} isCalling={selected?.id === encounter.id} actionLabel="Pilih" onAction={() => setSelectedId(encounter.id)} />) : <p className="ui-copy text-sm">Belum ada antrean farmasi demo.</p>}</div></aside>
        <section className="ui-card rounded-2xl p-5">{selected ? <><div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><div><h2 className="ui-heading text-base font-bold">{selected.patient?.name || 'Pasien contoh'}</h2><p className="ui-copy mt-1 text-xs">{selected.queueNumber} · {selected.poliName} · data lokal</p></div><div className="ui-surface-subtle flex rounded-xl border p-1" role="tablist" aria-label="Tahap penyelesaian"><button type="button" role="tab" aria-selected={tab === 'farmasi'} onClick={() => setTab('farmasi')} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === 'farmasi' ? 'ui-action' : 'ui-ghost'}`}>Farmasi</button><button type="button" role="tab" aria-selected={tab === 'kasir'} onClick={() => setTab('kasir')} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === 'kasir' ? 'ui-action' : 'ui-ghost'}`}>Kasir</button></div></div>
          {tab === 'farmasi' ? <div className="mt-5 space-y-4"><div className="ui-demo-note p-3">Pemeriksaan alergi dan resep di bawah ini adalah contoh UI; keputusan farmasi tetap dilakukan tenaga berwenang.</div>{selected.patient?.allergies?.length ? <p className="ui-status-danger rounded-xl border p-3 text-sm font-semibold">Alergi tercatat: {selected.patient.allergies.map((item) => item.substance).join(', ')}</p> : <p className="ui-status-neutral rounded-xl border p-3 text-sm">Riwayat alergi belum diverifikasi.</p>}<div><h3 className="ui-section-title">Resep contoh</h3><div className="mt-3 space-y-2">{selected.prescriptions?.length ? selected.prescriptions.map((item) => <div className="ui-surface-subtle flex justify-between gap-3 rounded-xl border p-3 text-sm" key={item.id}><div><p className="ui-heading font-bold">{item.name}</p><p className="ui-copy mt-1 text-xs">{item.dosage} · {item.signa}</p></div><span className="ui-chip h-fit rounded-lg px-2 py-1 text-xs font-bold">{item.quantity} {item.unit}</span></div>) : <p className="ui-copy text-sm">Tidak ada resep contoh.</p>}</div></div><div className="flex justify-end"><Button onClick={handover} disabled={selected.status === 'COMPLETED'}>Tandai penyerahan demo</Button></div></div> : <div className="mt-5 space-y-4"><div className="ui-demo-note p-3">Nominal berikut adalah preview. Tindakan ini tidak mengirim klaim, membuat SEP, atau mengunci rekam medis.</div><dl className="ui-surface-subtle divide-y rounded-xl border text-sm"><div className="flex justify-between p-3"><dt className="ui-copy">Konsultasi</dt><dd className="ui-heading font-mono font-bold">Rp {selected.billing?.consultationFee || 0}</dd></div><div className="flex justify-between p-3"><dt className="ui-copy">Obat</dt><dd className="ui-heading font-mono font-bold">Rp {selected.billing?.medicationFee || 0}</dd></div><div className="flex justify-between p-3"><dt className="ui-heading font-bold">Total demo</dt><dd className="ui-heading font-mono font-bold">Rp {selected.billing?.total || 0}</dd></div></dl><div className="flex justify-end"><Button onClick={complete} disabled={selected.status === 'COMPLETED'}>Selesaikan sesi demo</Button></div></div>}</> : <p className="ui-copy">Pilih antrean untuk melanjutkan.</p>}</section>
      </div>
    </div>{toast ? <div className="fixed bottom-5 right-5 z-50"><Toast tone={toast.tone} message={toast.message} /></div> : null}</main>
  );
}
