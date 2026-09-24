'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Toggle } from '@/components/atoms/toggle';
import { ShieldCheck, CheckCircle2, RadioTower, Sparkles, Building2 } from 'lucide-react';
import { defaultBpjsConfig } from '@/lib/bpjs/mock-bpjs-data';
import { generateBpjsHeaders } from '@/lib/bpjs/crypto';

const items = [
  { id: 'facility', label: 'Profil Fasilitas' },
  { id: 'integrations', label: 'Integrasi BPJS & SATUSEHAT' },
  { id: 'users', label: 'Pengguna & Role' },
  { id: 'notifications', label: 'Notifikasi' },
  { id: 'security', label: 'Keamanan' },
] as const;

type SettingsSection = (typeof items)[number]['id'];

const content: Record<SettingsSection, { title: string; description: string }> = {
  facility: {
    title: 'Profil Fasilitas',
    description: 'Kelola identitas fasilitas dan pilih tingkatan faskes (FKTP untuk P-Care atau FKRTL untuk V-Claim).',
  },
  integrations: {
    title: 'Integrasi BPJS & SATUSEHAT',
    description: 'Konfigurasi kredensial bridging TrustMark BPJS (P-Care, V-Claim, Antrol) dan uji signature HMAC-SHA256.',
  },
  users: { title: 'Pengguna & Role', description: 'Tinjau akses pengguna dan peran klinis secara terkontrol.' },
  notifications: { title: 'Notifikasi', description: 'Atur pengingat penting tanpa mencampurkannya dengan status klinis.' },
  security: { title: 'Keamanan', description: 'Tinjau kebijakan akses, sesi aktif, dan perlindungan data.' },
};

export function SettingsWorkspace() {
  const [active, setActive] = useState<SettingsSection>('facility');
  const [reminders, setReminders] = useState(true);

  // Facility profile state
  const [facilityType, setFacilityType] = useState<'FKTP' | 'FKRTL'>('FKTP');
  const [facilityName, setFacilityName] = useState('Klinik Pratama Kaduo Sehat');
  const [facilityCode, setFacilityCode] = useState('0123R001');

  // BPJS Bridging credentials state
  const [consId, setConsId] = useState(defaultBpjsConfig.consId);
  const [secretKey, setSecretKey] = useState(defaultBpjsConfig.secretKey);
  const [pcareKey, setPcareKey] = useState(defaultBpjsConfig.pcareUserKey);
  const [vclaimKey, setVclaimKey] = useState(defaultBpjsConfig.vclaimUserKey);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    timestamp: string;
    signature: string;
    message: string;
  } | null>(null);

  const current = content[active];

  const handleTestPing = async () => {
    setIsTestingPing(true);
    setPingResult(null);

    const userKeyToUse = facilityType === 'FKTP' ? pcareKey : vclaimKey;
    const { headers, timestamp } = await generateBpjsHeaders(consId, secretKey, userKeyToUse);

    setTimeout(() => {
      setPingResult({
        success: true,
        timestamp,
        signature: headers['X-signature'],
        message: `Koneksi simulasi TrustMark BPJS berhasil. Signature HMAC-SHA256 terverifikasi untuk ${facilityType === 'FKTP' ? 'P-Care v2.0' : 'V-Claim v2.0'}.`,
      });
      setIsTestingPing(false);
    }, 400);
  };

  return (
    <main className="ui-workspace">
      <div className="ui-workspace-inner grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside aria-label="Submenu Pengaturan" className="ui-card rounded-2xl lg:sticky lg:top-28 lg:h-fit lg:p-3">
          {/* Desktop header */}
          <div className="hidden border-b px-3 pb-4 lg:block">
            <p className="ui-copy text-xs font-bold uppercase tracking-wider">Konteks menu</p>
            <h1 className="ui-heading mt-1 text-lg font-bold">Pengaturan</h1>
          </div>

          {/* Mobile section label */}
          <div className="px-4 pt-3 pb-1 lg:hidden">
            <p className="ui-copy text-xs font-bold uppercase tracking-wider">Pengaturan</p>
          </div>

          {/* Mobile horizontal nav */}
          <nav className="flex overflow-x-auto gap-1 px-3 py-2 scrollbar-none lg:hidden">
            {items.map(({ id, label }) => (
              <button
                aria-current={active === id ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active === id ? 'ui-action' : 'ui-icon-button'
                }`}
                key={id}
                onClick={() => setActive(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop vertical nav */}
          <nav className="hidden mt-3 space-y-1 lg:block">
            {items.map(({ id, label }) => (
              <button
                aria-current={active === id ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  active === id ? 'ui-action-soft' : 'ui-ghost'
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
            <span className="ui-status-success inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Akses Terkontrol
            </span>
          </div>

          <div className="mt-8 max-w-2xl space-y-6">
            {active === 'facility' && (
              <div className="space-y-5">
                {/* Facility Type Selector (FKTP vs FKRTL) */}
                <div>
                  <label className="ui-heading mb-2 block text-sm font-bold">
                    Tingkatan Fasilitas Kesehatan (BPJS Workflow Mode)
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFacilityType('FKTP');
                        setFacilityName('Klinik Pratama Kaduo Sehat');
                      }}
                      className={`flex flex-col text-left rounded-2xl border p-4 transition-all ${
                        facilityType === 'FKTP'
                          ? 'border-[var(--action)] bg-[var(--action-soft)] ring-2 ring-[var(--action)]/30'
                          : 'border-stone-200 hover:border-stone-300 dark:border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">FKTP (Faskes Tingkat 1)</span>
                        {facilityType === 'FKTP' && <CheckCircle2 className="h-4 w-4 text-[var(--action)]" />}
                      </div>
                      <p className="ui-copy mt-1 text-xs leading-relaxed">
                        Puskesmas, Klinik Pratama, DPM. Menggunakan integrasi <strong>BPJS P-Care</strong> (Kapitasi,
                        Kunjungan Sakit/Sehat, dan Rujukan Vertikal ke RS).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFacilityType('FKRTL');
                        setFacilityName('RSUD Pasar Minggu / FKRTL');
                      }}
                      className={`flex flex-col text-left rounded-2xl border p-4 transition-all ${
                        facilityType === 'FKRTL'
                          ? 'border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30'
                          : 'border-stone-200 hover:border-stone-300 dark:border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">FKRTL (Rumah Sakit)</span>
                        {facilityType === 'FKRTL' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="ui-copy mt-1 text-xs leading-relaxed">
                        Rumah Sakit (Tipe A/B/C/D) & Klinik Utama. Menggunakan <strong>BPJS V-Claim</strong> (Penerbitan
                        SEP, Surat Kontrol/SPRI, PRB, dan E-Klaim INA-CBGs).
                      </p>
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="ui-heading mb-1 block text-sm font-semibold">Nama Fasilitas</span>
                  <Input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
                </label>

                <label className="block">
                  <span className="ui-heading mb-1 block text-sm font-semibold">Kode PPK BPJS</span>
                  <Input value={facilityCode} onChange={(e) => setFacilityCode(e.target.value)} />
                </label>

                <Button>Simpan Pengaturan Profil</Button>
              </div>
            )}

            {active === 'integrations' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 dark:border-stone-800 dark:bg-stone-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <RadioTower className="h-5 w-5 text-[var(--action)]" />
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Kredensial Portal BPJS TrustMark
                      </h3>
                    </div>
                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-mono font-bold dark:bg-stone-700">
                      Mode: {facilityType}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                    <div>
                      <label className="ui-label">Consumer ID (Cons-ID)</label>
                      <input
                        type="text"
                        className="ui-field mt-1 w-full font-mono text-xs"
                        value={consId}
                        onChange={(e) => setConsId(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="ui-label">Secret Key</label>
                      <input
                        type="password"
                        className="ui-field mt-1 w-full font-mono text-xs"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="ui-label">User Key P-Care (FKTP)</label>
                      <input
                        type="password"
                        className="ui-field mt-1 w-full font-mono text-xs"
                        value={pcareKey}
                        onChange={(e) => setPcareKey(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="ui-label">User Key V-Claim (FKRTL)</label>
                      <input
                        type="password"
                        className="ui-field mt-1 w-full font-mono text-xs"
                        value={vclaimKey}
                        onChange={(e) => setVclaimKey(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-stone-200 dark:border-stone-700 pt-4">
                    <p className="ui-copy text-xs">
                      Enkripsi: <strong>HMAC-SHA256 + AES-256-CBC</strong>
                    </p>
                    <button
                      type="button"
                      onClick={handleTestPing}
                      disabled={isTestingPing}
                      className="ui-action flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {isTestingPing ? 'Menguji Signature...' : 'Uji Signature BPJS'}
                    </button>
                  </div>
                </div>

                {pingResult && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs dark:border-emerald-900 dark:bg-emerald-950/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {pingResult.message}
                    </div>
                    <div className="font-mono text-[11px] text-stone-600 dark:text-stone-300 space-y-1 bg-white/70 dark:bg-stone-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                      <p>
                        <strong>X-timestamp:</strong> {pingResult.timestamp} (UTC)
                      </p>
                      <p className="truncate">
                        <strong>X-signature:</strong> {pingResult.signature}
                      </p>
                      <p>
                        <strong>Status Handshake:</strong> 200 OK (TrustMark Valid)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {active === 'users' && (
              <div className="ui-surface-subtle rounded-xl border p-5">
                <p className="ui-heading font-semibold">Manajemen Pengguna & Role</p>
                <p className="ui-copy mt-1 text-sm leading-6">
                  Role aktif: Dokter Penanggung Jawab, Petugas Admisi, Petugas Triase, dan Farmasi/Kasir.
                </p>
              </div>
            )}

            {active === 'notifications' && (
              <div className="space-y-4">
                <Toggle checked={reminders} label="Aktifkan pengingat administratif" onChange={setReminders} />
              </div>
            )}

            {active === 'security' && (
              <div className="ui-surface-subtle rounded-xl border p-5">
                <p className="ui-heading font-semibold">Kebijakan Keamanan & Audit Trail</p>
                <p className="ui-copy mt-1 text-sm leading-6">
                  Sesuai standar STARKES & UU PDP: seluruh aktivitas perubahan data rekam medis dicatat secara
                  immutable pada tabel audit log.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
