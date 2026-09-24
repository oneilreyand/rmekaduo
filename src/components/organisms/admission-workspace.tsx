'use client';

import { Printer, ShieldCheck, FileCheck2, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { QueueNumberBadge } from '@/components/atoms/queue-number-badge';
import { PatientSearchAutocomplete } from '@/components/molecules/patient-search-autocomplete';
import { Toast, type ToastTone } from '@/components/molecules/toast';
import { BpjsEligibilityCard } from '@/components/molecules/bpjs-eligibility-card';
import { VClaimSepModal } from '@/components/molecules/vclaim-sep-modal';
import { usePatientJourney, type RegisterPatientPayload } from '@/context/patient-journey-context';
import { PCareService } from '@/lib/bpjs/pcare-service';
import type { PCarePeserta } from '@/types/bpjs-pcare';
import type { VClaimSepResponse } from '@/types/bpjs-vclaim';
import type { Patient } from '@/types/rme';

const initialForm: RegisterPatientPayload = {
  name: '',
  nik: '',
  age: 30,
  gender: 'L',
  mrn: '',
  phone: '',
  paymentType: 'UMUM',
  bpjsNumber: '',
  bloodType: 'O+',
  allergySubstance: '',
  allergySeverity: 'SEDANG',
  allergyReaction: '',
  fallRisk: 'RENDAH',
  poliCode: 'POLI_UMUM',
  poliName: 'Poli Umum',
  doctorId: 'doc-demo',
  doctorName: 'Dokter Contoh',
};

export function AdmissionWorkspace() {
  const { encounters, registerPatient } = usePatientJourney();
  const [form, setForm] = useState(initialForm);
  const [ticket, setTicket] = useState<{ number: string; name: string } | null>(null);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);

  // Bridging State
  const [bpjsPeserta, setBpjsPeserta] = useState<PCarePeserta | null>(null);
  const [isCheckingBpjs, setIsCheckingBpjs] = useState(false);
  const [isSepModalOpen, setIsSepModalOpen] = useState(false);
  const [activeSep, setActiveSep] = useState<VClaimSepResponse | null>(null);

  const set = <K extends keyof RegisterPatientPayload>(key: K, value: RegisterPatientPayload[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const showToast = (tone: ToastTone, message: string) => {
    setToast({ tone, message });
    window.setTimeout(() => setToast(null), 3200);
  };

  const selectPatient = (patient: Patient) => {
    setForm((previous) => ({
      ...previous,
      name: patient.name,
      nik: patient.nik,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      bloodType: patient.bloodType,
      bpjsNumber: patient.bpjsNumber || '',
      paymentType: patient.bpjsNumber ? 'BPJS' : 'UMUM',
      allergySubstance: patient.allergies[0]?.substance || '',
      allergySeverity: patient.allergies[0]?.severity || 'SEDANG',
      allergyReaction: patient.allergies[0]?.reaction || '',
      fallRisk: patient.fallRisk,
    }));

    if (patient.bpjsNumber) {
      handleCheckBpjs(patient.bpjsNumber);
    }
    showToast('info', 'Data pasien dimuat ke formulir pendaftaran.');
  };

  const handleCheckBpjs = async (targetId?: string) => {
    const idToQuery = targetId || form.bpjsNumber || form.nik;
    if (!idToQuery || !idToQuery.trim()) {
      showToast('error', 'Masukkan No. Kartu BPJS atau NIK pasien.');
      return;
    }

    setIsCheckingBpjs(true);
    try {
      const res = await PCareService.checkPeserta(idToQuery);
      if (res.response) {
        setBpjsPeserta(res.response);
        set('bpjsNumber', res.response.noKartu);
        set('paymentType', 'BPJS');
        if (!form.name || form.name.includes('contoh')) {
          set('name', res.response.nama);
        }
        showToast('success', `Status BPJS terverifikasi: ${res.response.statusPeserta.keterangan}`);
      }
    } catch {
      showToast('error', 'Gagal memverifikasi status peserta BPJS.');
    } finally {
      setIsCheckingBpjs(false);
    }
  };

  const handleSepCreated = (sep: VClaimSepResponse) => {
    setActiveSep(sep);
    showToast('success', `SEP berhasil diterbitkan: ${sep.noSep}`);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.nik.trim()) {
      showToast('error', 'Isi nama dan NIK pasien terlebih dahulu.');
      return;
    }
    const encounter = registerPatient(form);
    setTicket({ number: encounter.queueNumber, name: encounter.patient?.name || form.name });
    showToast('success', `Antrean ${encounter.queueNumber} berhasil dibuat dan sinkron ke sistem.`);
  };

  return (
    <main className="ui-workspace">
      <div className="ui-workspace-inner space-y-5">
        <header className="ui-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <p className="ui-eyebrow text-xs font-bold">ADMISI & PENDAFTARAN</p>
            <h1 className="ui-workspace-heading mt-1">Pendaftaran Pasien & Bridging BPJS</h1>
            <p className="ui-copy mt-1 text-sm">
              Verifikasi kepesertaan P-Care, penerbitan SEP V-Claim, dan registrasi kunjungan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="ui-status-success flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Bridging P-Care & V-Claim Siap
            </span>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-5">
            <div className="ui-card rounded-2xl p-5">
              <label className="ui-label mb-2">Cari Data Pasien Terdaftar</label>
              <PatientSearchAutocomplete
                patients={encounters.flatMap((encounter) => (encounter.patient ? [encounter.patient] : []))}
                onSelectPatient={selectPatient}
                onNewPatient={() => {
                  setForm(initialForm);
                  setTicket(null);
                  setBpjsPeserta(null);
                  setActiveSep(null);
                }}
              />
            </div>

            {/* BPJS Card Verification Result */}
            {bpjsPeserta && (
              <BpjsEligibilityCard peserta={bpjsPeserta} onClear={() => setBpjsPeserta(null)} />
            )}

            <form onSubmit={submit} className="ui-card space-y-5 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="ui-section-title">Formulir Pendaftaran</h2>
                  <p className="ui-copy mt-1 text-xs">Pilih penjamin dan verifikasi data bridging sebelum membuat antrean.</p>
                </div>
                {form.paymentType === 'BPJS' && (
                  <button
                    type="button"
                    onClick={() => setIsSepModalOpen(true)}
                    className="ui-secondary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" /> Terbitkan SEP V-Claim
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="ui-label">
                  Nama Lengkap Pasien
                  <input
                    required
                    className="ui-field mt-1.5"
                    value={form.name}
                    onChange={(event) => set('name', event.target.value)}
                    placeholder="Nama pasien"
                  />
                </label>

                <label className="ui-label">
                  NIK (16 Digit)
                  <input
                    required
                    className="ui-field mt-1.5 font-mono"
                    value={form.nik}
                    onChange={(event) => set('nik', event.target.value)}
                    placeholder="317101..."
                  />
                </label>

                <label className="ui-label">
                  Usia (Tahun)
                  <input
                    type="number"
                    min="0"
                    className="ui-field mt-1.5"
                    value={form.age}
                    onChange={(event) => set('age', Number(event.target.value))}
                  />
                </label>

                <label className="ui-label">
                  Jenis Kelamin
                  <select
                    className="ui-field mt-1.5"
                    value={form.gender}
                    onChange={(event) => set('gender', event.target.value as 'L' | 'P')}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </label>

                <label className="ui-label">
                  Poliklinik Tujuan
                  <select
                    className="ui-field mt-1.5"
                    value={form.poliCode}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        poliCode: event.target.value,
                        poliName: event.target.options[event.target.selectedIndex].text,
                      }))
                    }
                  >
                    <option value="POLI_UMUM">Poli Umum</option>
                    <option value="POLI_GIGI">Poli Gigi</option>
                    <option value="POLI_KIA">Poli KIA / Kebidanan</option>
                  </select>
                </label>

                <label className="ui-label">
                  Metode Pembayaran (Penjamin)
                  <select
                    className="ui-field mt-1.5"
                    value={form.paymentType}
                    onChange={(event) => set('paymentType', event.target.value as 'BPJS' | 'UMUM')}
                  >
                    <option value="UMUM">Pasien Umum</option>
                    <option value="BPJS">BPJS Kesehatan</option>
                  </select>
                </label>

                {form.paymentType === 'BPJS' && (
                  <div className="col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <label className="ui-label text-emerald-900 dark:text-emerald-200">
                      Nomor Kartu BPJS Kesehatan
                    </label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        type="text"
                        className="ui-field w-full font-mono text-xs"
                        placeholder="Contoh: 0001234567891"
                        value={form.bpjsNumber}
                        onChange={(e) => set('bpjsNumber', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleCheckBpjs()}
                        disabled={isCheckingBpjs}
                        className="ui-action flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shrink-0 shadow-xs"
                      >
                        <Search className="h-3.5 w-3.5" />
                        {isCheckingBpjs ? 'Mengecek...' : 'Cek Status BPJS'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <label className="ui-label">
                Catatan Alergi Pasien
                <input
                  className="ui-field mt-1.5"
                  value={form.allergySubstance}
                  onChange={(event) => set('allergySubstance', event.target.value)}
                  placeholder="Contoh: Amoksisilin, Penisilin"
                />
              </label>

              {activeSep && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-100/50 p-3 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-center justify-between">
                  <span>
                    SEP Terlampir: <strong>{activeSep.noSep}</strong> ({activeSep.poli})
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    V-Claim Valid
                  </span>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 border-t border-stone-100 dark:border-stone-800 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setForm(initialForm);
                    setTicket(null);
                    setBpjsPeserta(null);
                    setActiveSep(null);
                  }}
                >
                  Bersihkan Formulir
                </Button>
                <Button type="submit">Daftarkan & Buat Tiket</Button>
              </div>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="ui-card rounded-2xl p-5">
              <h2 className="ui-section-title">Antrean Aktif Saat Ini</h2>
              <div className="mt-3 space-y-2">
                {encounters.slice(0, 5).map((encounter) => (
                  <div
                    className="ui-surface-subtle flex items-center justify-between rounded-xl border p-3"
                    key={encounter.id}
                  >
                    <div className="flex items-center gap-3">
                      <QueueNumberBadge number={encounter.queueNumber} status={encounter.status} size="sm" />
                      <span className="ui-copy truncate text-xs font-semibold">
                        {encounter.patient?.name || 'Pasien'}
                      </span>
                    </div>
                    {encounter.billing?.paymentMethod === 'BPJS' && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        BPJS
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="ui-card rounded-2xl p-5 text-center">
              {ticket ? (
                <>
                  <QueueNumberBadge number={ticket.number} status="IN_QUEUE" size="xl" />
                  <h2 className="ui-heading mt-3 text-sm font-bold">{ticket.name}</h2>
                  <p className="ui-copy mt-1 text-xs">
                    {form.paymentType === 'BPJS' ? 'Pasien JKN-KIS (Terdaftar P-Care)' : 'Pasien Umum'}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.print()}
                  >
                    <Printer aria-hidden="true" className="h-3.5 w-3.5" />
                    Cetak Karcis Antrean
                  </Button>
                </>
              ) : (
                <p className="ui-copy text-sm">Pratinjau nomor antrean akan tampil di sini setelah registrasi.</p>
              )}
            </section>
          </aside>
        </div>
      </div>

      {/* V-Claim SEP Modal Dialog */}
      <VClaimSepModal
        isOpen={isSepModalOpen}
        onClose={() => setIsSepModalOpen(false)}
        defaultCardNumber={form.bpjsNumber || '0001234567890'}
        defaultNik={form.nik || '3171012304790002'}
        defaultPatientName={form.name || 'Tn. Budi Santoso'}
        onSepCreated={handleSepCreated}
      />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast tone={toast.tone} message={toast.message} />
        </div>
      ) : null}
    </main>
  );
}
