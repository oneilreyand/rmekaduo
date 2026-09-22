'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';

const visitTrend = [44, 60, 52, 72, 68, 82, 76];
const reviewTrend = [18, 12, 16, 8, 10, 5, 7];
const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function AnalyticsPreview() {
  return (
    <div className="grid w-full gap-7 md:grid-cols-2">
      <section>
        <h4 className="ui-heading text-sm font-bold">Tren kunjungan</h4>
        <p className="ui-copy mt-1 text-xs">Contoh visualisasi volume layanan mingguan.</p>
        <div className="mt-4 flex h-36 items-end gap-2 border-b pb-5">
          {visitTrend.map((value, index) => (
            <div className="flex flex-1 flex-col items-center justify-end gap-2" key={dayLabels[index]}>
              <span aria-label={`${dayLabels[index]}: ${value} kunjungan`} className="w-full rounded-t-sm bg-[var(--chart-primary)]" style={{ height: `${value}px` }} />
              <span className="ui-copy text-[10px]">{dayLabels[index]}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h4 className="ui-heading text-sm font-bold">Catatan perlu ditinjau</h4>
        <p className="ui-copy mt-1 text-xs">Contoh tren pekerjaan yang menunggu verifikasi.</p>
        <svg aria-label="Grafik tren catatan yang perlu ditinjau" className="mt-4 h-36 w-full overflow-visible" role="img" viewBox="0 0 240 130">
          {[25, 50, 75, 100].map((y) => <line className="ui-chart-grid" key={y} strokeWidth="1" x1="0" x2="240" y1={y} y2={y} />)}
          <polyline className="ui-chart-primary" fill="none" points={reviewTrend.map((value, index) => `${10 + index * 36},${120 - value * 5}`).join(' ')} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          {reviewTrend.map((value, index) => <circle className="ui-chart-point" cx={10 + index * 36} cy={120 - value * 5} key={dayLabels[index]} r="4" strokeWidth="2" />)}
        </svg>
      </section>
    </div>
  );
}

export function DashboardStats() {
  const metrics = [
    { label: 'Kunjungan hari ini', value: '24', detail: 'Data contoh' },
    { label: 'Catatan siap ditinjau', value: '12', detail: 'Data contoh' },
    { label: 'Waktu layanan rata-rata', value: '18 mnt', detail: 'Data contoh' },
  ];
  return <div className="grid w-full gap-4 sm:grid-cols-3">{metrics.map(({ detail, label, value }) => <div className="ui-surface-subtle rounded-xl border p-4" key={label}><p className="ui-copy text-[11px] font-bold uppercase tracking-wide">{label}</p><p className="ui-heading mt-3 text-2xl font-black">{value}</p><p className="ui-copy mt-1 text-xs">{detail}</p></div>)}</div>;
}

export function DataTablePreview() {
  const [page, setPage] = useState(1);
  const rows = [
    ['UI-101', 'Status kunjungan', 'Siap', 'DR'],
    ['UI-102', 'Form pemeriksaan', 'Draf', 'NA'],
    ['UI-103', 'Konfirmasi resep', 'Perlu tinjau', 'AP'],
  ];
  const toneFor = (status: string) => status === 'Siap' ? 'success' : status === 'Draf' ? 'neutral' : 'warning';
  return <div className="w-full overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b text-[11px] uppercase tracking-wide"><tr className="ui-copy"><th className="pb-2">ID contoh</th><th className="pb-2">Komponen</th><th className="pb-2">Status</th><th className="pb-2">Pemilik</th></tr></thead><tbody>{rows.map(([id, title, status, owner]) => <tr className="border-b" key={id}><td className="ui-heading py-3 font-mono text-xs font-bold">{id}</td><td className="ui-heading py-3 font-medium">{title}</td><td className="py-3"><Badge tone={toneFor(status) as 'success' | 'neutral' | 'warning'}>{status}</Badge></td><td className="py-3"><Avatar initials={owner} size="sm" /></td></tr>)}</tbody></table><div className="mt-4 flex items-center justify-end gap-2 text-xs"><button aria-label="Halaman sebelumnya" className="ui-icon-button rounded-lg px-2 py-1 disabled:opacity-50" disabled={page === 1} onClick={() => setPage((value) => value - 1)} type="button">Sebelumnya</button><span className="ui-copy">Halaman {page} dari 2</span><button aria-label="Halaman berikutnya" className="ui-icon-button rounded-lg px-2 py-1 disabled:opacity-50" disabled={page === 2} onClick={() => setPage((value) => value + 1)} type="button">Berikutnya</button></div></div>;
}

export function ErrorFallback() {
  return <div className="ui-surface-subtle w-full rounded-xl border p-6 text-center"><AlertTriangle className="ui-text-danger mx-auto h-9 w-9" /><h3 className="ui-heading mt-3 text-lg font-bold">Tampilan belum tersedia</h3><p className="ui-copy mx-auto mt-2 max-w-md text-sm">Gunakan kembali tindakan ini setelah layanan siap. Pesan ini hanya contoh state pemulihan antarmuka.</p><Button className="mt-4" variant="secondary">Coba lagi</Button></div>;
}
