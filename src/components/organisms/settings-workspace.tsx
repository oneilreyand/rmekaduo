'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Toggle } from '@/components/atoms/toggle';

const items = [
  { id: 'facility', label: 'Profil Fasilitas' },
  { id: 'users', label: 'Pengguna & Role' },
  { id: 'notifications', label: 'Notifikasi' },
  { id: 'security', label: 'Keamanan' },
  { id: 'integrations', label: 'Integrasi' },
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

  return (
    <main className="ui-workspace">
      <div className="ui-workspace-inner grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside aria-label="Submenu Pengaturan" className="ui-card rounded-2xl lg:sticky lg:top-28 lg:h-fit lg:p-3">
          {/* Desktop: vertical sidebar header */}
          <div className="hidden border-b px-3 pb-4 lg:block">
            <p className="ui-copy text-xs font-bold uppercase tracking-wider">Konteks menu</p>
            <h1 className="ui-heading mt-1 text-lg font-bold">Pengaturan</h1>
          </div>

          {/* Mobile/tablet: section label */}
          <div className="px-4 pt-3 pb-1 lg:hidden">
            <p className="ui-copy text-xs font-bold uppercase tracking-wider">Pengaturan</p>
          </div>

          {/* Mobile/tablet: horizontal scrollable nav */}
          <nav className="flex overflow-x-auto gap-1 px-3 py-2 scrollbar-none lg:hidden">
            {items.map(({ id, label }) => (
              <button
                aria-current={active === id ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active === id
                    ? 'ui-action'
                    : 'ui-icon-button'
                }`}
                key={id}
                onClick={() => setActive(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop: vertical nav list */}
          <nav className="hidden mt-3 space-y-1 lg:block">
            {items.map(({ id, label }) => (
              <button
                aria-current={active === id ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  active === id
                    ? 'ui-action-soft'
                    : 'ui-ghost'
                }`}
                key={id}
                onClick={() => setActive(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>


        <section className="ui-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
            <div>
              <p className="ui-eyebrow text-sm font-semibold">Pengaturan RME</p>
              <h2 className="ui-heading mt-1 text-2xl font-bold tracking-tight">{current.title}</h2>
              <p className="ui-copy mt-2 max-w-2xl text-sm leading-6">{current.description}</p>
            </div>
            <span className="ui-status-success inline-flex rounded-full border px-3 py-1.5 text-xs font-bold">Akses terkontrol</span>
          </div>

          <div className="mt-8 max-w-xl space-y-5">
            {active === 'facility' ? (
              <>
                <label className="block">
                  <span className="ui-heading mb-2 block text-sm font-semibold">Nama fasilitas</span>
                  <Input defaultValue="Klinik Kaduo" />
                </label>
                <label className="block">
                  <span className="ui-heading mb-2 block text-sm font-semibold">Kode fasilitas</span>
                  <Input defaultValue="KSS-001" />
                </label>
                <Button>Simpan perubahan</Button>
              </>
            ) : (
              <>
                <div className="ui-surface-subtle rounded-xl border p-5">
                  <p className="ui-heading font-semibold">Contoh pengaturan {current.title}</p>
                  <p className="ui-copy mt-1 text-sm leading-6">Konten detail akan mengikuti kontrak dan hak akses pada modul ini.</p>
                </div>
                {active === 'notifications' && <Toggle checked={reminders} label="Aktifkan pengingat administratif" onChange={setReminders} />}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
