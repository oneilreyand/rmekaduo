'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Building2, CreditCard, UserCheck } from 'lucide-react';
import type { PCarePeserta } from '@/types/bpjs-pcare';

interface BpjsEligibilityCardProps {
  peserta: PCarePeserta | null;
  isLoading?: boolean;
  onClear?: () => void;
}

export function BpjsEligibilityCard({ peserta, isLoading, onClear }: BpjsEligibilityCardProps) {
  if (isLoading) {
    return (
      <div className="ui-card flex items-center gap-3 rounded-2xl p-4 border border-stone-200 animate-pulse">
        <div className="h-10 w-10 rounded-xl bg-stone-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-stone-200" />
          <div className="h-3 w-1/2 rounded bg-stone-200" />
        </div>
      </div>
    );
  }

  if (!peserta) return null;

  const isAktif = peserta.statusPeserta.kode === '0' || peserta.aktif;

  return (
    <div
      className={`ui-card relative rounded-2xl border p-4 shadow-sm transition-all ${
        isAktif
          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
          : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl font-bold text-white shadow-xs ${
              isAktif ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="ui-heading text-sm font-bold">{peserta.nama}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isAktif
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                }`}
              >
                {isAktif ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> AKTIF BPJS
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" /> NONAKTIF
                  </>
                )}
              </span>
            </div>
            <p className="ui-copy text-xs">
              NIK: <span className="font-mono font-semibold">{peserta.nik}</span> • No. Kartu:{' '}
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {peserta.noKartu}
              </span>
            </p>
          </div>
        </div>

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="ui-ghost text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Tutup
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <div className="space-y-0.5">
          <span className="ui-label text-[10px] flex items-center gap-1">
            <CreditCard className="h-3 w-3" /> Hak Kelas
          </span>
          <p className="font-semibold text-stone-900 dark:text-stone-100">
            {peserta.hakKelas.keterangan || 'Kelas 1'}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="ui-label text-[10px] flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> Jenis Peserta
          </span>
          <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
            {peserta.jnsPeserta.nama || 'PPU Swasta'}
          </p>
        </div>

        <div className="col-span-2 space-y-0.5 sm:col-span-1">
          <span className="ui-label text-[10px] flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Provider Terdaftar (PPK 1)
          </span>
          <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
            {peserta.kdProviderPst.nmProvider}
          </p>
        </div>
      </div>

      {!isAktif && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-100/70 p-2.5 text-xs text-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>
            <strong>Perhatian:</strong> {peserta.ketAktif || 'Status kepesertaan tidak aktif. Pasien dialihkan ke penjamin UMUM atau mohon pelunasan iuran.'}
          </span>
        </div>
      )}
    </div>
  );
}
