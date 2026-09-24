'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import type { PCareRujukanResponse, PCareFaskesRujukanSubspesialis, PCareRujukanPayload } from '@/types/bpjs-pcare';
import { PCareService } from '@/lib/bpjs/pcare-service';

interface PCareRujukanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  bpjsNumber: string;
  primaryDiagnosis: string;
  onRujukanCreated?: (rujukan: PCareRujukanResponse) => void;
}

export function PCareRujukanModal({
  isOpen,
  onClose,
  patientName,
  bpjsNumber,
  primaryDiagnosis,
  onRujukanCreated,
}: PCareRujukanModalProps) {
  const [hospitals, setHospitals] = useState<PCareFaskesRujukanSubspesialis[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('0112R001');
  const [subSpesialis, setSubSpesialis] = useState('Poli Penyakit Dalam');
  const [tglEstRujuk, setTglEstRujuk] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [kdTacc, setKdTacc] = useState<number>(3); // 3 = Complication
  const [alasanTacc, setAlasanTacc] = useState('Komplikasi tidak terkontrol di faskes primer');
  const [catatan, setCatatan] = useState('Mohon penanganan dan pemeriksaan penunjang lanjutan spesialis.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRujukan, setCreatedRujukan] = useState<PCareRujukanResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      PCareService.getFaskesRujukanSubspesialis().then((data) => {
        setHospitals(data);
        if (data.length > 0) setSelectedHospital(data[0].kdppk);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitRujukan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: PCareRujukanPayload = {
      noKunjungan: `0123R001${Date.now().toString().slice(-8)}`,
      tglEstRujuk,
      kdppk: selectedHospital,
      kdSubSpesialis: subSpesialis,
      tacc: {
        kdTacc,
        alasanTacc,
      },
      catatan,
    };

    try {
      const res = await PCareService.createRujukanVertikal(payload);
      setCreatedRujukan(res.response);
      if (onRujukanCreated) {
        onRujukanCreated(res.response);
      }
    } catch {
      setErrorMsg('Gagal menerbitkan surat rujukan vertikal P-Care.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pcare-rujukan-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="ui-card flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-xs">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 id="pcare-rujukan-title" className="ui-heading text-base font-bold">
                Penerbitan Surat Rujukan Vertikal (P-Care)
              </h2>
              <p className="ui-copy text-xs">Rujukan Berjenjang FKTP $\rightarrow$ Rumah Sakit (FKRTL)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="ui-icon-button grid h-8 w-8 place-items-center rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {createdRujukan ? (
            /* Printable Rujukan View */
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Surat Rujukan Berhasil Diterbitkan ke Sistem BPJS P-Care!</span>
              </div>

              <div className="rounded-2xl border border-stone-300 bg-stone-50/50 p-5 dark:border-stone-700 dark:bg-stone-800/50 font-sans shadow-inner">
                <div className="border-b border-dashed border-stone-300 pb-3 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    BPJS KESEHATAN • FASKES TINGKAT PERTAMA
                  </p>
                  <h3 className="text-base font-black tracking-tight text-stone-900 dark:text-stone-100">
                    SURAT RUJUKAN RAWAT JALAN
                  </h3>
                  <p className="text-xs text-stone-500">KLINIK PRATAMA KADUO SEHAT (Kode: 0123R001)</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-stone-500">No. Rujukan:</span>
                    <p className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      {createdRujukan.noRujukan}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Tgl. Rujuk:</span>
                    <p className="font-semibold">{createdRujukan.tglRujuk}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Nama Pasien:</span>
                    <p className="font-bold">{patientName}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">No. Kartu BPJS:</span>
                    <p className="font-mono font-semibold">{bpjsNumber}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">RS Tujuan Rujukan:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">
                      {createdRujukan.ppkRujukan.nmPPK}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Rencana Kunjungan:</span>
                    <p className="font-semibold">{createdRujukan.tglEstRujuk}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500">Poli / Spesialisasi:</span>
                    <p className="font-semibold">{createdRujukan.subSpesialis.nmSubSpesialis}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500">Catatan Klinis:</span>
                    <p className="font-semibold">{createdRujukan.catatan}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center justify-center border-t border-dashed border-stone-300 pt-3">
                  <div className="font-mono text-[10px] tracking-widest text-stone-400 select-none">
                    |||| || ||| |||| | || |||| ||| |||| | |||
                  </div>
                  <p className="font-mono text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    *{createdRujukan.noRujukan}*
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 italic">
                    Berlaku 90 hari sejak tanggal diterbitkan.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="ui-secondary flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
                >
                  <Printer className="h-4 w-4" /> Cetak Lembar Rujukan
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="ui-action rounded-xl px-5 py-2 text-xs font-bold shadow-sm"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmitRujukan} className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-800/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{patientName}</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {bpjsNumber}
                  </span>
                </div>
                <p className="ui-copy mt-1">
                  Diagnosa Klinis: <strong>{primaryDiagnosis}</strong>
                </p>
              </div>

              {/* Destination Hospital Selection */}
              <div>
                <label className="ui-label text-xs">Pilih Rumah Sakit Rujukan (FKRTL)</label>
                <div className="mt-2 space-y-2">
                  {hospitals.map((rs) => (
                    <label
                      key={rs.kdppk}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 text-xs transition-all ${
                        selectedHospital === rs.kdppk
                          ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                          : 'border-stone-200 hover:border-stone-300 dark:border-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedHospital"
                          value={rs.kdppk}
                          checked={selectedHospital === rs.kdppk}
                          onChange={(e) => setSelectedHospital(e.target.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-bold text-stone-900 dark:text-stone-100">{rs.nmppk}</p>
                          <p className="ui-copy text-[11px]">
                            {rs.alamat} • {rs.jarakKm} km
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Sisa Kuota: {rs.kuotaTersedia}
                        </span>
                        <p className="text-[10px] text-stone-400 mt-0.5">Kelas {rs.kelas}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* TACC & Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="ui-label">Estimasi Tanggal Kunjungan</label>
                  <input
                    type="date"
                    className="ui-field mt-1 w-full text-xs"
                    value={tglEstRujuk}
                    onChange={(e) => setTglEstRujuk(e.target.value)}
                  />
                </div>

                <div>
                  <label className="ui-label">Kriteria TACC Rujukan</label>
                  <select
                    className="ui-field mt-1 w-full text-xs"
                    value={kdTacc}
                    onChange={(e) => setKdTacc(Number(e.target.value))}
                  >
                    <option value={1}>Time (Kasus Kronis / Perjalanan Penyakit)</option>
                    <option value={2}>Age (Usia Ekstrim / Bayi / Geriatri)</option>
                    <option value={3}>Complication (Komplikasi Akut / Tidak Tertangani)</option>
                    <option value={4}>Comorbidity (Penyakit Penyerta Ganda)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="ui-label">Alasan Klinis TACC</label>
                  <input
                    type="text"
                    className="ui-field mt-1 w-full text-xs"
                    value={alasanTacc}
                    onChange={(e) => setAlasanTacc(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="ui-label">Catatan Rekomendasi untuk Dokter RS</label>
                  <textarea
                    rows={2}
                    className="ui-field mt-1 w-full text-xs"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-stone-100 dark:border-stone-800 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="ui-ghost rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ui-action flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Menerbitkan Rujukan...' : 'Terbitkan Rujukan P-Care'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
