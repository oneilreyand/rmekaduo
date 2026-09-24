'use client';

import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Printer,
  Search,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { VClaimRujukan, VClaimSepPayload, VClaimSepResponse } from '@/types/bpjs-vclaim';
import { VClaimService } from '@/lib/bpjs/vclaim-service';

interface VClaimSepModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCardNumber?: string;
  defaultNik?: string;
  defaultPatientName?: string;
  onSepCreated?: (sep: VClaimSepResponse) => void;
}

export function VClaimSepModal({
  isOpen,
  onClose,
  defaultCardNumber = '0001234567890',
  defaultNik = '3171012304790002',
  defaultPatientName = 'Tn. Budi Santoso',
  onSepCreated,
}: VClaimSepModalProps) {
  const [cardNumber, setCardNumber] = useState(defaultCardNumber);
  const [rujukanData, setRujukanData] = useState<VClaimRujukan | null>(null);
  const [isSearchingRujukan, setIsSearchingRujukan] = useState(false);
  const [createdSep, setCreatedSep] = useState<VClaimSepResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [poliTujuan, setPoliTujuan] = useState('Poli Penyakit Dalam');
  const [dpjp, setDpjp] = useState('dr. Siti Rahmawati, Sp.PD');
  const [diagAwal, setDiagAwal] = useState('J06.9 - Infeksi Saluran Pernapasan Akut');
  const [jnsPelayanan, setJnsPelayanan] = useState<'1' | '2'>('2'); // 2 = Rawat Jalan
  const [catatan, setCatatan] = useState('Pemeriksaan lanjutan rujukan FKTP');

  if (!isOpen) return null;

  const handleLookupRujukan = async () => {
    setIsSearchingRujukan(true);
    setErrorMsg(null);
    try {
      const res = await VClaimService.checkRujukan(cardNumber);
      if (res.response) {
        setRujukanData(res.response);
        setPoliTujuan(res.response.poliRujukan.nama);
        setDiagAwal(`${res.response.diagnosa.kode} - ${res.response.diagnosa.nama}`);
      }
    } catch {
      setErrorMsg('Gagal menemukan rujukan. Periksa kembali nomor kartu atau rujukan.');
    } finally {
      setIsSearchingRujukan(false);
    }
  };

  const handleCreateSep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: VClaimSepPayload = {
      noKartu: cardNumber,
      tglSep: new Date().toISOString().split('T')[0],
      ppkPelayanan: '0123R001',
      jnsPelayanan,
      klsRawatHak: '1',
      noMR: 'RM-DEMO-01',
      rujukan: {
        asalRujukan: '1',
        tglRujukan: rujukanData?.tglKunjungan || new Date().toISOString().split('T')[0],
        noRujukan: rujukanData?.noKunjungan || `0123R0010926P${String(Math.floor(Math.random() * 900000) + 100000)}`,
        ppkRujukan: rujukanData?.provPerujuk.kode || '0123R001',
      },
      catatan,
      diagAwal: diagAwal.split(' - ')[0] || 'J06.9',
      poli: {
        tujuan: poliTujuan,
        eksekutif: '0',
      },
      dpjpLayan: dpjp,
      noTelp: '081234567890',
      user: 'ADM-LOKET-01',
    };

    try {
      const res = await VClaimService.createSep(payload);
      setCreatedSep(res.response);
      if (onSepCreated) {
        onSepCreated(res.response);
      }
    } catch {
      setErrorMsg('Gagal menerbitkan SEP ke server BPJS V-Claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vclaim-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="ui-card flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="vclaim-title" className="ui-heading text-base font-bold">
                Penerbitan Surat Eligibilitas Peserta (SEP)
              </h2>
              <p className="ui-copy text-xs">Modul BPJS V-Claim v2.0 • Fasilitas Rujukan (FKRTL)</p>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {createdSep ? (
            /* Printable SEP Slip View */
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>SEP Berhasil Diterbitkan dan Tersimpan di Server BPJS V-Claim!</span>
              </div>

              {/* SEP Paper Card */}
              <div className="rounded-2xl border border-stone-300 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-800/50 p-5 font-sans shadow-inner">
                <div className="border-b border-dashed border-stone-300 pb-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    BPJS KESEHATAN • KANTOR CABANG UTAMA
                  </p>
                  <h3 className="text-base font-black tracking-tight text-stone-900 dark:text-stone-100">
                    SURAT ELIGIBILITAS PESERTA (SEP)
                  </h3>
                  <p className="text-xs text-stone-500">RSUD PASAR MINGGU (Kode PPK: 0123R001)</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-stone-500">No. SEP:</span>
                    <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {createdSep.noSep}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Tgl. SEP:</span>
                    <p className="font-semibold">{createdSep.tglSep}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">No. Kartu:</span>
                    <p className="font-mono font-semibold">{createdSep.peserta.noKartu}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Nama Pasien:</span>
                    <p className="font-bold">{createdSep.peserta.nama}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Poli Tujuan:</span>
                    <p className="font-semibold">{createdSep.poli}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Jenis Pelayanan:</span>
                    <p className="font-semibold">{createdSep.jnsPelayanan}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500">Diagnosa Awal:</span>
                    <p className="font-semibold">{createdSep.diagnosa}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500">DPJP:</span>
                    <p className="font-semibold">{createdSep.dpjp}</p>
                  </div>
                </div>

                {/* Barcode Graphic */}
                <div className="mt-5 flex flex-col items-center justify-center border-t border-dashed border-stone-300 pt-4">
                  <div className="font-mono text-[10px] tracking-widest text-stone-400 select-none">
                    ||| | |||| | ||| |||| || | |||| ||| || | ||||
                  </div>
                  <p className="font-mono text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    *{createdSep.noSep}*
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 italic">
                    Saya menyetujui penjaminan biaya pelayanan kesehatan sesuai ketentuan BPJS.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="ui-secondary flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
                >
                  <Printer className="h-4 w-4" /> Cetak Lembar SEP
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="ui-action rounded-xl px-5 py-2 text-xs font-bold shadow-sm"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleCreateSep} className="space-y-4">
              {/* Lookup Card / NIK */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-800/40">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="ui-label text-xs">Nomor Kartu BPJS / NIK Pasien</label>
                    <input
                      type="text"
                      className="ui-field mt-1 w-full font-mono text-xs"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Masukkan 13 digit nomor kartu"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLookupRujukan}
                    disabled={isSearchingRujukan}
                    className="ui-action flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs shrink-0"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {isSearchingRujukan ? 'Mencari...' : 'Cari Rujukan FKTP'}
                  </button>
                </div>

                {rujukanData && (
                  <div className="mt-3 rounded-xl bg-white p-3 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Rujukan FKTP Valid
                      </span>
                      <span className="font-mono text-[11px] text-stone-500">
                        {rujukanData.noKunjungan}
                      </span>
                    </div>
                    <p className="ui-copy">
                      Dari: <strong>{rujukanData.provPerujuk.nama}</strong> • Tgl:{' '}
                      {rujukanData.tglKunjungan}
                    </p>
                    <p className="ui-copy">
                      Diagnosa Perujuk: <em>{rujukanData.diagnosa.kode} - {rujukanData.diagnosa.nama}</em>
                    </p>
                  </div>
                )}
              </div>

              {/* Form parameters */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="ui-label">Jenis Pelayanan</label>
                  <select
                    className="ui-field mt-1 w-full text-xs"
                    value={jnsPelayanan}
                    onChange={(e) => setJnsPelayanan(e.target.value as '1' | '2')}
                  >
                    <option value="2">Rawat Jalan Tingkat Lanjut (RJTL)</option>
                    <option value="1">Rawat Inap Tingkat Lanjut (RITL)</option>
                  </select>
                </div>

                <div>
                  <label className="ui-label">Poli Tujuan Rumah Sakit</label>
                  <select
                    className="ui-field mt-1 w-full text-xs"
                    value={poliTujuan}
                    onChange={(e) => setPoliTujuan(e.target.value)}
                  >
                    <option value="Poli Penyakit Dalam">Poli Penyakit Dalam (INT)</option>
                    <option value="Poli Paru">Poli Pulmonologi / Paru (PAR)</option>
                    <option value="Poli Jantung">Poli Jantung & Pembuluh Darah (JAN)</option>
                    <option value="Poli Bedah">Poli Bedah Umum (BED)</option>
                  </select>
                </div>

                <div>
                  <label className="ui-label">DPJP Penanggung Jawab</label>
                  <select
                    className="ui-field mt-1 w-full text-xs"
                    value={dpjp}
                    onChange={(e) => setDpjp(e.target.value)}
                  >
                    <option value="dr. Siti Rahmawati, Sp.PD">dr. Siti Rahmawati, Sp.PD</option>
                    <option value="dr. Budi Setiawan, Sp.P">dr. Budi Setiawan, Sp.P</option>
                    <option value="dr. Sarah Amalia, Sp.PD">dr. Sarah Amalia, Sp.PD</option>
                  </select>
                </div>

                <div>
                  <label className="ui-label">Diagnosa Awal (ICD-10)</label>
                  <input
                    type="text"
                    className="ui-field mt-1 w-full text-xs"
                    value={diagAwal}
                    onChange={(e) => setDiagAwal(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="ui-label">Catatan Pelayanan / Keluhan</label>
                  <input
                    type="text"
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
                  <ShieldCheck className="h-4 w-4" />
                  {isSubmitting ? 'Memproses ke V-Claim...' : 'Terbitkan SEP V-Claim'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
