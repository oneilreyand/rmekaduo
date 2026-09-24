'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Plus, Trash2, ShieldCheck, ShieldAlert, Send, FileText, CheckCircle2 } from 'lucide-react';
import type { Patient, VitalSigns, PrescriptionItem, PastVisit, SoapNote } from '@/types/rme';
import { PatientBanner } from '@/components/organisms/patient-banner';
import { Sparkline } from '@/components/atoms/sparkline';
import { InteractivePainSlider } from '@/components/molecules/interactive-pain-slider';
import { SmartDosageChips } from '@/components/molecules/smart-dosage-chips';
import { DiagnosticMacroPills, type DiagnosticMacro } from '@/components/molecules/diagnostic-macro-pills';
import { FloatingClinicalDock } from '@/components/organisms/floating-clinical-dock';
import { Toast, type ToastTone } from '@/components/molecules/toast';
import { PCareRujukanModal } from '@/components/molecules/pcare-rujukan-modal';
import { PCareService } from '@/lib/bpjs/pcare-service';
import { VClaimService } from '@/lib/bpjs/vclaim-service';

const mockPatient: Patient = {
  id: 'pat-001',
  name: 'Pasien Contoh',
  age: 45,
  gender: 'L',
  mrn: 'RM-DEMO',
  nik: 'ID-DEMO',
  bpjsStatus: 'NONAKTIF',
  bpjsNumber: 'BPJS-DEMO',
  bloodType: 'O+',
  allergies: [
    {
      substance: 'Amoksisilin',
      severity: 'BERAT',
      reaction: 'Ruam eritema difus & edema glotis',
    },
  ],
  fallRisk: 'SEDANG',
  ihsNumber: 'IHS-DEMO',
};

const pastVisits: PastVisit[] = [
  {
    date: '14 Agu 2026',
    diagnosis: 'J06.9 Akut nasofaringitis',
    doctor: 'Dokter Contoh',
    medications: ['Paracetamol 500mg (3x1)', 'Cetirizine 10mg (1x1)'],
  },
  {
    date: '28 Mei 2026',
    diagnosis: 'I10 Hipertensi primer',
    doctor: 'Dokter Contoh',
    medications: ['Amlodipine 5mg (1x1 malam)'],
  },
];

const icd10Suggestions = [
  { code: 'J06.9', name: 'Akut nasofaringitis [common cold]' },
  { code: 'I10', name: 'Essential (primary) hypertension' },
  { code: 'K30', name: 'Dyspepsia' },
  { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications' },
  { code: 'J02.9', name: 'Acute pharyngitis, unspecified' },
  { code: 'A09', name: 'Infectious gastroenteritis and colitis, unspecified' },
];

import { usePatientJourney } from '@/context/patient-journey-context';

export function ClinicalConsultationWorkspace() {
  const {
    encounters,
    activeConsultationId,
    setActiveConsultationId,
    completeConsultation,
  } = usePatientJourney();

  const consultationEncounter =
    encounters.find((e) => e.id === activeConsultationId) || encounters[0];
  const patient = consultationEncounter?.patient || mockPatient;
  const vitals = consultationEncounter?.vitals || {
    systolic: 120,
    diastolic: 80,
    heartRate: 82,
    respiratoryRate: 18,
    temperature: 36.6,
    spo2: 98,
    weightKg: 68,
    heightCm: 170,
    painScale: 2,
  };
  const [painScale, setPainScale] = useState<number>(vitals.painScale || 2);

  // SOAP state
  const [soap, setSoap] = useState<SoapNote>({
    subjective: 'Akut nasofaringitis [common cold], tenggorokan perih sejak kemarin sore.',
    objective: 'KU: tampak sakit ringan. Kesadaran: CM. Faring hiperemis (+). Paru: sonor, vesikuler (+/+).',
    assessment: 'J06.9 - Akut nasofaringitis [common cold]',
    plan: 'Paracetamol 500mg 3x1 tablet, Vitamin C 500mg 1x1 tablet, istirahat cukup 2 hari.',
    icd10Code: 'J06.9',
    icd10Name: 'Akut nasofaringitis [common cold]',
  });

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('J06.9');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Prescription state
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      kfaCode: '93000123',
      name: 'Paracetamol 500 mg Tablet',
      dosage: '3 x 1 tablet sehari',
      signa: 'sesudah makan (p.c.)',
      quantity: 10,
      unit: 'Tablet',
    },
  ]);
  const [medInput, setMedInput] = useState('');
  const [dosageInput, setDosageInput] = useState('3 x 1 tablet sehari');
  const [qtyInput, setQtyInput] = useState(10);
  const [allergyAlert, setAllergyAlert] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Bridging State
  const [isRujukanModalOpen, setIsRujukanModalOpen] = useState(false);
  const [isSyncingPCare, setIsSyncingPCare] = useState(false);
  const [isCreatingSuratKontrol, setIsCreatingSuratKontrol] = useState(false);

  const medInputRef = useRef<HTMLInputElement>(null);

  // Check allergy whenever medInput changes
  useEffect(() => {
    const query = medInput.toLowerCase();
    const match = patient.allergies.find((a) =>
      query.includes(a.substance.toLowerCase()) || (a.substance.toLowerCase() === 'amoksisilin' && query.includes('amox'))
    );
    if (match) {
      setAllergyAlert(`PERINGATAN KESELAMATAN: Pasien memiliki riwayat alergi ${match.severity} terhadap ${match.substance}!`);
    } else {
      setAllergyAlert(null);
    }
  }, [medInput, patient.allergies]);

  // Global Keyboard Shortcuts (⌘S / Ctrl+S to save, ⌥R to focus prescription)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.altKey && (e.key === 'r' || e.key === '®')) {
        e.preventDefault();
        medInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soap, prescriptions]);

  const handleMacroSelect = (macro: DiagnosticMacro) => {
    setSoap({
      subjective: macro.data.subjective,
      objective: macro.data.objective,
      assessment: macro.data.assessment,
      plan: macro.data.plan,
      icd10Code: macro.data.icd10Code,
      icd10Name: macro.data.icd10Name,
    });
    setSearchQuery(macro.data.icd10Code);
    showToast('info', `Template SOAP [${macro.label}] berhasil diterapkan.`);
  };

  const handleAddPrescription = () => {
    if (!medInput.trim()) return;
    if (allergyAlert) {
      showToast('error', 'Tidak dapat menambahkan obat dengan riwayat alergi fatal!');
      return;
    }
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      kfaCode: 'KFA-MOCK-' + Math.floor(Math.random() * 10000),
      name: medInput,
      dosage: dosageInput,
      signa: 'sesudah makan',
      quantity: Number(qtyInput) || 10,
      unit: 'Tablet',
    };
    setPrescriptions((prev) => [...prev, newItem]);
    setMedInput('');
    showToast('success', `Resep ${newItem.name} ditambahkan.`);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (consultationEncounter) {
        completeConsultation(consultationEncounter.id, soap, prescriptions);
      }
      showToast(
        'success',
        `Catatan contoh ${patient.name} disimpan di sesi browser dan diteruskan ke antrean farmasi demo.`
      );
    }, 450);
  };

  const handleSyncPCare = async () => {
    setIsSyncingPCare(true);
    try {
      const res = await PCareService.submitPelayanan({
        noKartu: patient.bpjsNumber || '0001234567891',
        tglDaftar: new Date().toISOString().split('T')[0],
        kdPoli: '001',
        keluhan: soap.subjective,
        kdSadar: '01',
        sistole: vitals.systolic,
        diastole: vitals.diastolic,
        beratBadan: vitals.weightKg,
        tinggiBadan: vitals.heightCm,
        respRate: vitals.respiratoryRate,
        heartRate: vitals.heartRate,
        kdStatusPulang: '3',
        tglPulang: new Date().toISOString().split('T')[0],
        kdDokter: 'DOC-01',
        kdDiag1: soap.icd10Code || 'J06.9',
        anamnesa: soap.subjective,
        terapi: soap.plan,
      });
      showToast('success', `P-Care Terverifikasi: ${res.metaData?.message || 'Data pelayanan tersimpan'}`);
    } catch {
      showToast('error', 'Gagal mengirim data pelayanan ke BPJS P-Care.');
    } finally {
      setIsSyncingPCare(false);
    }
  };

  const handleCreateSuratKontrol = async () => {
    setIsCreatingSuratKontrol(true);
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      const res = await VClaimService.createSuratKontrol({
        noSEP: '0123R0010926V000001',
        tglRencanaKontrol: targetDate.toISOString().split('T')[0],
        poliKontrol: 'Poli Penyakit Dalam',
        kodeDokter: 'DOC-01',
        user: 'DOKTER-SPESIALIS',
      });
      showToast('success', `Surat Kontrol V-Claim Terbit: ${res.response.noSuratKontrol}`);
    } catch {
      showToast('error', 'Gagal membuat Surat Kontrol V-Claim.');
    } finally {
      setIsCreatingSuratKontrol(false);
    }
  };

  const showToast = (tone: ToastTone, message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredIcd = icd10Suggestions.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="ui-workspace pb-24">
      <div className="ui-workspace-inner space-y-4">
        {/* DOCTOR CONSULTATION QUEUE SELECTOR */}
        <div className="ui-demo-note flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="ui-heading text-xs font-bold shrink-0">
              Antrean konsultasi demo:
            </span>
            <div className="flex items-center gap-1.5">
              {encounters
                .filter((e) => e.status !== 'COMPLETED')
                .map((enc) => {
                  const isActive =
                    activeConsultationId === enc.id ||
                    (!activeConsultationId && enc.id === consultationEncounter?.id);
                  return (
                    <button
                      key={enc.id}
                      type="button"
                      onClick={() => setActiveConsultationId(enc.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                        isActive
                        ? 'ui-action shadow-xs'
                        : 'ui-secondary border hover:bg-[var(--action-soft)]'
                      }`}
                    >
                      <span className="font-mono">{enc.queueNumber}</span>
                      <span className="truncate max-w-[110px]">{enc.patient?.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
          <span className="ui-chip rounded-md px-2.5 py-0.5 text-[10px] font-mono font-bold">
            Alur lokal — tidak tersambung ke layanan eksternal
          </span>
        </div>

        {/* TOP PATIENT BANNER */}
        <PatientBanner patient={patient} />

        {/* MAIN WORKSPACE GRID: 60% CLINICAL NOTES | 40% TELEMETRY & PRESCRIPTIONS */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* LEFT PANEL: 7 COLS (approx 58-60%) */}
          <section className="space-y-4 lg:col-span-7">
            <div className="ui-card rounded-2xl p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3.5">
                <h3 className="ui-heading text-sm font-extrabold tracking-tight">
                  Catatan SOAP contoh
                </h3>
                <span className="ui-kbd rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold">
                  FORM-SOAP-01
                </span>
              </div>

              {/* 1-Click Diagnostic Macro Pills */}
              <div className="pt-3.5 pb-2">
                <DiagnosticMacroPills onSelect={handleMacroSelect} />
              </div>

              {/* SOAP INPUT FIELDS */}
              <div className="mt-3 space-y-3.5">
                {/* Subjective */}
                <div>
                  <label className="ui-heading mb-1 block text-xs font-bold">
                    S - Subjective (Keluhan Utama & Riwayat Penyakit Sekarang)
                  </label>
                  <textarea
                    rows={2}
                    value={soap.subjective}
                    onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                    className="ui-input w-full rounded-xl border p-2.5 text-sm"
                    placeholder="Masukkan keluhan pasien..."
                  />
                </div>

                {/* Objective */}
                <div>
                  <label className="ui-heading mb-1 block text-xs font-bold">
                    O - Objective (Pemeriksaan Fisik & Status Lokalis)
                  </label>
                  <textarea
                    rows={2}
                    value={soap.objective}
                    onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                    className="ui-input w-full rounded-xl border p-2.5 text-sm"
                    placeholder="Hasil pemeriksaan fisik..."
                  />
                </div>

                {/* Assessment & ICD-10 Search */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="ui-heading text-xs font-bold">
                      A - Assessment (Diagnosa ICD-10)
                    </label>
                    <span className="ui-copy text-[11px]">Pencarian kode contoh</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Cari kode ICD-10 (misal: J06.9, Hipertensi)..."
                      className="ui-input h-10 w-full rounded-xl border px-3 text-sm"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isDropdownOpen && filteredIcd.length > 0 && (
                    <div className="ui-card absolute left-0 right-0 top-18 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl p-1 shadow-lg">
                      {filteredIcd.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setSearchQuery(`${item.code} - ${item.name}`);
                            setSoap({
                              ...soap,
                              icd10Code: item.code,
                              icd10Name: item.name,
                              assessment: `${item.code} - ${item.name}`,
                            });
                            setIsDropdownOpen(false);
                          }}
                          className="ui-ghost flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-[var(--action-soft)]"
                        >
                          <span className="font-mono font-bold text-[var(--action)]">
                            {item.code}
                          </span>
                          <span className="ui-heading max-w-[320px] truncate font-medium">
                            {item.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plan */}
                <div>
                  <label className="ui-heading mb-1 block text-xs font-bold">
                    P - Plan (Rencana Pengobatan & Terapi)
                  </label>
                  <textarea
                    rows={2}
                    value={soap.plan}
                    onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                    className="ui-input w-full rounded-xl border p-2.5 text-sm"
                    placeholder="Instruksi rencana terapi, edukasi pasien, dan rujukan..."
                  />
                </div>

                {/* Bridging Clinical Actions (P-Care & V-Claim) */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-850/50">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="ui-heading text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[var(--action)]" />
                      Layanan Bridging BPJS Klinis
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      No. Kartu: {patient.bpjsNumber || '0001234567891'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSyncPCare}
                      disabled={isSyncingPCare}
                      className="ui-action flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isSyncingPCare ? 'Mengirim ke P-Care...' : 'Kirim Pelayanan P-Care'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRujukanModalOpen(true)}
                      className="ui-secondary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border border-indigo-200 text-indigo-800 dark:border-indigo-800 dark:text-indigo-300"
                    >
                      <Send className="h-3.5 w-3.5 text-indigo-600" />
                      Rujuk ke RS (P-Care)
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateSuratKontrol}
                      disabled={isCreatingSuratKontrol}
                      className="ui-secondary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border border-emerald-200 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300"
                    >
                      <FileText className="h-3.5 w-3.5 text-emerald-600" />
                      {isCreatingSuratKontrol ? 'Membuat...' : 'Surat Kontrol (V-Claim)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL: 5 COLS (approx 40-42%) */}
          <section className="space-y-4 lg:col-span-5">
            {/* VITAL SIGNS TELEMETRY CARD */}
            <div className="ui-card rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between border-b pb-2.5">
                <h3 className="ui-heading text-xs font-extrabold tracking-tight">
                  Telemetri Tanda Vital (TTV)
                </h3>
                <span className="ui-status-success rounded-full border px-2 py-0.5 text-[10px] font-bold">
                  Normal Range
                </span>
              </div>

              {/* Blood Pressure Row with Sparkline */}
              <div className="ui-surface-subtle mt-3 flex items-center justify-between rounded-xl p-3">
                <div>
                  <p className="ui-copy text-[11px] font-semibold">
                    Tekanan Darah
                  </p>
                  <p className="ui-heading font-mono text-base font-extrabold">
                    {vitals.systolic}/{vitals.diastolic} <span className="ui-copy text-[11px] font-normal">mmHg</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="ui-text-success text-[9px] font-medium">Tren 4 Kunjungan</span>
                  <Sparkline data={[128, 125, 122, 120]} normalRange={[110, 130]} color="var(--chart-primary)" />
                </div>
              </div>

              {/* Heart Rate Row with Sparkline */}
              <div className="ui-surface-subtle mt-2.5 flex items-center justify-between rounded-xl p-3">
                <div>
                  <p className="ui-copy text-[11px] font-semibold">
                    Denyut Nadi
                  </p>
                  <p className="ui-heading font-mono text-base font-extrabold">
                    {vitals.heartRate} <span className="ui-copy text-[11px] font-normal">bpm</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="ui-text-success text-[9px] font-medium">Tren 4 Kunjungan</span>
                  <Sparkline data={[78, 85, 80, 82]} normalRange={[60, 100]} color="var(--chart-normal)" />
                </div>
              </div>

              {/* Other Vital Signs Grid */}
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                <div className="ui-surface-subtle rounded-xl border p-2">
                  <span className="ui-copy text-[10px]">Suhu</span>
                  <p className="ui-heading font-mono font-bold">{vitals.temperature}°C</p>
                </div>
                <div className="ui-surface-subtle rounded-xl border p-2">
                  <span className="ui-copy text-[10px]">RR</span>
                  <p className="ui-heading font-mono font-bold">{vitals.respiratoryRate}/m</p>
                </div>
                <div className="ui-surface-subtle rounded-xl border p-2">
                  <span className="ui-copy text-[10px]">SpO2</span>
                  <p className="ui-text-success font-mono font-bold">{vitals.spo2}%</p>
                </div>
                <div className="ui-surface-subtle rounded-xl border p-2">
                  <span className="ui-copy text-[10px]">BB / TB</span>
                  <p className="ui-heading font-mono font-bold">{vitals.weightKg}k/{vitals.heightCm}</p>
                </div>
              </div>
            </div>

            {/* PAIN SCALE SLIDER */}
            <InteractivePainSlider value={painScale} onChange={setPainScale} />

            {/* E-PRESCRIPTION BUILDER */}
            <div className="ui-card rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between border-b pb-2.5">
                <h3 className="ui-heading text-xs font-extrabold tracking-tight">
                  Resep contoh
                </h3>
                {allergyAlert ? (
                  <span className="ui-text-danger flex items-center gap-1 text-[10px] font-bold">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Kontraindikasi Alergi
                  </span>
                ) : (
                  <span className="ui-status-success flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Aman Tanpa Kontraindikasi
                  </span>
                )}
              </div>

              {/* Prescriptions List */}
              <div className="mt-3 space-y-2">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="ui-surface-subtle flex items-center justify-between rounded-xl border px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="ui-heading font-bold">{rx.name}</p>
                      <p className="ui-copy text-[11px]">
                        {rx.dosage} • {rx.quantity} {rx.unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePrescription(rx.id)}
                      className="ui-copy p-1 transition-colors hover:text-[var(--danger-text)]"
                      title="Hapus resep"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Prescription Field */}
              <div className="mt-3 space-y-2 border-t pt-3">
                <div>
                  <label className="ui-heading mb-1 block text-[11px] font-bold">
                    Tambah obat contoh
                  </label>
                  <input
                    ref={medInputRef}
                    type="text"
                    value={medInput}
                    onChange={(e) => setMedInput(e.target.value)}
                    placeholder="Ketik nama obat (misal: Cetirizine 10mg)..."
                    className="ui-input h-9 w-full rounded-xl border px-3 text-xs"
                  />
                  {allergyAlert && (
                    <p className="ui-text-danger mt-1 flex items-center gap-1 text-[11px] font-bold">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {allergyAlert}
                    </p>
                  )}
                </div>

                {/* Smart Dosage Chips */}
                <SmartDosageChips onSelect={(val) => setDosageInput(val)} />

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={dosageInput}
                    onChange={(e) => setDosageInput(e.target.value)}
                    placeholder="Aturan pakai..."
                    className="ui-input h-8 flex-1 rounded-lg border px-2.5 text-xs"
                  />
                  <input
                    type="number"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(Number(e.target.value))}
                    className="ui-input h-8 w-16 rounded-lg border px-2 text-center text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="ui-action inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-bold transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* PAST VISITS ACCORDION */}
            <div className="ui-card rounded-2xl p-3.5 shadow-xs">
              <h3 className="ui-heading mb-2 text-xs font-bold">Riwayat contoh</h3>
              <div className="space-y-2">
                {pastVisits.map((visit, idx) => (
                  <div
                    key={idx}
                    className="ui-surface-subtle rounded-xl border p-2.5 text-xs"
                  >
                    <div className="ui-heading flex justify-between font-semibold">
                      <span>{visit.diagnosis}</span>
                      <span className="ui-copy font-mono text-[10px]">{visit.date}</span>
                    </div>
                    <p className="ui-copy mt-0.5 text-[11px]">
                      DPJP: {visit.doctor} • Terapi: {visit.medications.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FLOATING ACTION DOCK */}
      <FloatingClinicalDock
        onSave={handleSave}
        isSaving={isSaving}
        onResetPrescription={() => {
          setSoap({
            subjective: '',
            objective: '',
            assessment: '',
            plan: '',
            icd10Code: '',
            icd10Name: '',
          });
          setPrescriptions([]);
          showToast('info', 'Formulir SOAP & Resep dikosongkan.');
        }}
      />

      {/* TOAST SNACKBAR */}
      {toast && (
        <div className="fixed bottom-20 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Toast tone={toast.tone} message={toast.message} />
        </div>
      )}

      {/* PCARE RUJUKAN MODAL DIALOG */}
      <PCareRujukanModal
        isOpen={isRujukanModalOpen}
        onClose={() => setIsRujukanModalOpen(false)}
        patientName={patient.name}
        bpjsNumber={patient.bpjsNumber || '0001234567891'}
        primaryDiagnosis={soap.assessment}
        onRujukanCreated={(rujukan) => {
          showToast('success', `Surat Rujukan P-Care ${rujukan.noRujukan} berhasil diterbitkan.`);
        }}
      />
    </main>
  );
}
