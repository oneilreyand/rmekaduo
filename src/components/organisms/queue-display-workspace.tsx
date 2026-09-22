'use client';

import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button';
import { QueueNumberBadge } from '@/components/atoms/queue-number-badge';
import { usePatientJourney } from '@/context/patient-journey-context';

export function QueueDisplayWorkspace() {
  const { encounters } = usePatientJourney();
  const [time, setTime] = useState('');
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const waiting = encounters.filter((encounter) => !['COMPLETED', 'CANCELLED'].includes(encounter.status));
  const current = waiting[0];

  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="ui-workspace"><div className="ui-workspace-inner space-y-5">
      <header className="ui-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"><div><p className="ui-eyebrow text-xs font-bold">LAYAR ANTREAN</p><h1 className="ui-workspace-heading mt-1">Antrean poli</h1><p className="ui-copy mt-1 text-sm">Preview publik dengan data demonstrasi.</p></div><time className="ui-heading font-mono text-xl font-bold">{time}</time></header>
      <p className="ui-demo-note p-3">Layar ini hanya memvisualisasikan antrean dari sesi browser. Tidak mengirim panggilan suara atau data ke perangkat lain.</p>
      <section className="ui-card grid gap-5 rounded-2xl p-6 text-center md:grid-cols-[1fr_auto_1fr] md:items-center"><div className="order-2 md:order-1"><p className="ui-copy text-sm">Nomor yang dipanggil</p><QueueNumberBadge number={current?.queueNumber || '--'} status={current?.status || 'BOOKED'} size="xl" isCalling={Boolean(current)} /></div><div className="order-1 md:order-2"><h2 className="ui-heading text-lg font-bold">{current?.poliName || 'Belum ada antrean'}</h2><p className="ui-copy mt-1 text-sm">{current ? 'Silakan menunggu petunjuk petugas.' : 'Antrean akan tampil saat tersedia.'}</p>{current ? <Button className="mt-4" variant="secondary" onClick={() => setAnnouncement(`Panggilan lokal untuk nomor ${current.queueNumber}.`)}><Volume2 aria-hidden="true" className="h-4 w-4" />Preview panggilan</Button> : null}</div><div className="order-3"><p className="ui-copy text-sm">Nama</p><p className="ui-heading mt-1 text-base font-bold">{current?.patient?.name || '—'}</p></div></section>
      {announcement ? <p role="status" className="ui-status-neutral rounded-xl border p-3 text-center text-sm">{announcement}</p> : null}
      <section className="ui-card rounded-2xl p-5"><h2 className="ui-section-title">Daftar antrean</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{waiting.map((encounter) => <div className="ui-surface-subtle flex items-center gap-3 rounded-xl border p-3" key={encounter.id}><QueueNumberBadge number={encounter.queueNumber} status={encounter.status} size="sm" /><div className="min-w-0"><p className="ui-heading truncate text-sm font-bold">{encounter.poliName}</p><p className="ui-copy text-xs">Status alur lokal</p></div></div>)}</div></section>
    </div></main>
  );
}
