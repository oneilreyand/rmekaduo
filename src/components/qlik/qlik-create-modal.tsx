'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Stethoscope,
  Smartphone,
  Layers,
  CheckCircle2,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { QlikStream } from '@/types/qlik';

interface QlikCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  streams: QlikStream[];
  onCreateApp: (newAppData: {
    title: string;
    description: string;
    streamId: string;
    streamName: string;
    tags: string[];
    iconName: string;
  }) => void;
}

export const QlikCreateModal: React.FC<QlikCreateModalProps> = ({
  isOpen,
  onClose,
  streams,
  onCreateApp,
}) => {
  const [activeTab, setActiveTab] = useState<'patient' | 'app' | 'sheet'>('patient');

  // Form states for Patient
  const [patientNik, setPatientNik] = useState('');
  const [patientName, setPatientName] = useState('');
  const [targetPoli, setTargetPoli] = useState('Poli Umum');
  const [paymentType, setPaymentType] = useState<'BPJS' | 'UMUM'>('BPJS');

  // Form states for New App / Workspace
  const [appTitle, setAppTitle] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState(streams[1]?.id || 'rawat-jalan');

  if (!isOpen) return null;

  const handleSubmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientNik || !patientName) return;

    onCreateApp({
      title: `Pemeriksaan Pasien: ${patientName}`,
      description: `Sesi rawat jalan aktif di ${targetPoli} (${paymentType}). NIK: ${patientNik}. Menunggu giliran dokter periksa.`,
      streamId: 'rawat-jalan',
      streamName: 'Pelayanan Rawat Jalan',
      tags: ['Pasien Baru', targetPoli, paymentType, 'Aktif'],
      iconName: 'Stethoscope',
    });

    onClose();
  };

  const handleSubmitApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appTitle) return;

    const stream = streams.find((s) => s.id === selectedStreamId) || streams[0];
    onCreateApp({
      title: appTitle,
      description: appDescription || 'Aplikasi ruang kerja klinis RME terintegrasi.',
      streamId: stream.id,
      streamName: stream.name,
      tags: ['Custom App', 'RME', 'Qlik'],
      iconName: 'Layers',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* MODAL HEADER (Harmonized with theme!) */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#009845] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              +
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Tambah Baru ke Qlik Hub</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Registrasi pasien atau buat ruang kerja baru</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'patient'
                ? 'border-[#009845] text-[#009845]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Registrasi Pasien & Sesi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('app')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'app'
                ? 'border-[#009845] text-[#009845]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Buat Aplikasi / Workspace</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6">
          {activeTab === 'patient' ? (
            <form onSubmit={handleSubmitPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={patientNik}
                  onChange={(e) => setPatientNik(e.target.value)}
                  placeholder="3273250102900001 (16 Digit)"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Nama Lengkap Pasien
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Poli Layanan Tujuan
                  </label>
                  <select
                    value={targetPoli}
                    onChange={(e) => setTargetPoli(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845] bg-white dark:bg-slate-800 cursor-pointer"
                  >
                    <option value="Poli Umum">Poli Umum</option>
                    <option value="Poli Gigi & Mulut">Poli Gigi & Mulut</option>
                    <option value="Poli KIA / Anak">Poli KIA / Anak</option>
                    <option value="IGD Pratama">IGD Pratama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Jenis Penjamin
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845] bg-white dark:bg-slate-800 cursor-pointer"
                  >
                    <option value="BPJS">BPJS Kesehatan (JKN-KIS)</option>
                    <option value="UMUM">Pasien Mandiri (Umum)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-[#009845] mt-0.5 flex-shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  Pasien otomatis terhubung ke sistem antrean BPJS Antrol v2 dan divalidasi ke SATUSEHAT IHS Kemenkes.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#009845] hover:bg-[#00823B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Daftarkan Pasien & Buka Sesi
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitApp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Nama Aplikasi / Workspace
                </label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="Misal: Monitoring Waktu Tunggu Poli Lansia"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Pilih Stream / Space
                </label>
                <select
                  value={selectedStreamId}
                  onChange={(e) => setSelectedStreamId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845] bg-white dark:bg-slate-800 cursor-pointer"
                >
                  {streams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Deskripsi Ruang Kerja
                </label>
                <textarea
                  rows={3}
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="Jelaskan tujuan dan cakupan rekam medis pada workspace ini..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#009845] hover:bg-[#00823B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Buat Aplikasi Qlik Hub
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
