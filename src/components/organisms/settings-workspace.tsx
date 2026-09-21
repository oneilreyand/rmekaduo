'use client';

import { BellRing, Building2, ChevronRight, Link2, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Toggle } from '@/components/atoms/toggle';

const items = [
  { id: 'facility', label: 'Profil Fasilitas', icon: Building2 },
  { id: 'users', label: 'Pengguna & Role', icon: UsersRound },
  { id: 'notifications', label: 'Notifikasi', icon: BellRing },
  { id: 'security', label: 'Keamanan', icon: ShieldCheck },
  { id: 'integrations', label: 'Integrasi', icon: Link2 },
] as const;

type SettingsSection = (typeof items)[number]['id'];

const content: Record<SettingsSection, { title: string; description: string }> = {
  facility: { title: 'Profil Fasilitas', description: 'Kelola identitas fasilitas yang ditampilkan pada sistem RME.' },
  users: { title: 'Pengguna & Role', description: 'Tinjau akses pengguna dan peran klinis secara terkontrol.' },
  notifications: { title: 'Notifikasi', description: 'Atur pengingat penting tanpa mencampurkannya dengan status klinis.' },
  security: { title: 'Keamanan', description: 'Tinjau kebijakan akses, sesi aktif, dan perlindungan data.' },
  integrations: { title: 'Integrasi', description: 'Hubungkan layanan yang telah disetujui untuk fasilitas.' },
};

export function SettingsWorkspace() {
  const [active, setActive] = useState<SettingsSection>('facility');
  const [reminders, setReminders] = useState(true);
  const current = content[active];

  return <main className="min-h-[calc(100vh-6rem)] bg-[#f8fafc] p-5 sm:p-8 lg:p-10"><div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[248px_minmax(0,1fr)]"><aside aria-label="Submenu Pengaturan" className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28"><div className="border-b border-slate-100 px-3 pb-4"><p className="text-xs font-bold uppercase tracking-wider text-[#557b83]">Konteks menu</p><h1 className="mt-1 text-lg font-bold text-[#0f172a]">Pengaturan</h1></div><nav className="mt-3 space-y-1">{items.map(({ icon: Icon, id, label }) => <button aria-current={active === id ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30a0e0] ${active === id ? 'bg-[#e6f4fb] text-[#006bbb]' : 'text-[#557b83] hover:bg-slate-50 hover:text-[#0f172a]'}`} key={id} onClick={() => setActive(id)} type="button"><Icon className="h-4 w-4" />{label}<ChevronRight className="ml-auto h-4 w-4 opacity-60" /></button>)}</nav></aside><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6"><div><p className="text-sm font-semibold text-[#006bbb]">Pengaturan RME</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0f172a]">{current.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#557b83]">{current.description}</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#eaf6f6] px-3 py-1.5 text-xs font-bold text-[#0f766e]"><LockKeyhole className="h-3.5 w-3.5" />Akses terkontrol</span></div><div className="mt-8 max-w-xl space-y-5">{active === 'facility' ? <><label className="block"><span className="mb-2 block text-sm font-semibold text-[#0f172a]">Nama fasilitas</span><Input defaultValue="Klinik Sehat Sentosa" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-[#0f172a]">Kode fasilitas</span><Input defaultValue="KSS-001" /></label><Button>Simpan perubahan</Button></> : <><div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><p className="font-semibold text-[#0f172a]">Contoh pengaturan {current.title}</p><p className="mt-1 text-sm leading-6 text-[#557b83]">Konten detail akan mengikuti kontrak dan hak akses pada modul ini.</p></div>{active === 'notifications' && <Toggle checked={reminders} label="Aktifkan pengingat administratif" onChange={setReminders} />}</>}</div></section></div></main>;
}
