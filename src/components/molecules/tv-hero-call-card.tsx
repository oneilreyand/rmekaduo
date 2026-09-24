'use client';

import React from 'react';
import { Volume2, UserCheck, Stethoscope, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import type { Encounter } from '@/types/rme';
import { maskPatientName } from '@/lib/tv-sound-chime';

interface TVHeroCallCardProps {
  encounter?: Encounter | null;
  isCalling?: boolean;
  maskPrivacy?: boolean;
  onRecall?: () => void;
  counterLabel?: string;
  roomLabel?: string;
  isFullscreen?: boolean;
}

export function TVHeroCallCard({
  encounter,
  isCalling = false,
  maskPrivacy = true,
  onRecall,
  counterLabel,
  roomLabel = 'Ruang Periksa 1',
  isFullscreen = false,
}: TVHeroCallCardProps) {
  const patientName = encounter?.patient?.name;
  const displayName = maskPrivacy ? maskPatientName(patientName) : (patientName || '—');
  const poliName = counterLabel || encounter?.poliName || 'Poli Umum';
  const doctorName = encounter?.doctorName || 'dr. Pemeriksa';
  const queueNum = encounter?.queueNumber || '--';

  return (
    <div
      className={`ui-card relative overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
        isFullscreen ? 'h-full flex flex-col justify-between' : ''
      } ${
        isCalling
          ? 'border-[var(--action)] shadow-[0_0_30px_rgba(255,122,26,0.3)]'
          : 'border-[var(--border-strong)]'
      }`}
    >
      {/* Top Banner: Loket / Poli identification */}
      <div
        className={`ui-surface-subtle flex shrink-0 flex-wrap items-center justify-between gap-2 border-b ${
          isFullscreen ? 'px-4 py-2 sm:px-6 sm:py-2.5' : 'px-6 py-3.5'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--action)]">
            PANGGILAN SEKARANG
          </span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--action-soft)] px-3.5 py-1 text-xs sm:text-sm font-black text-[var(--action)]">
          <Stethoscope className="h-4 w-4" />
          <span>{poliName} • {roomLabel}</span>
        </div>
      </div>

      {/* Main Calling Content */}
      <div
        className={`flex flex-col items-center justify-center text-center ${
          isFullscreen
            ? 'flex-1 min-h-0 p-3 sm:p-5 lg:p-6'
            : 'p-6 lg:p-8'
        }`}
      >
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
          NOMOR ANTREAN
        </p>

        {/* ─── Jumbo Queue Number (Diperbesar Ekstra Besar agar Terlihat Jelas dari Jauh) ─── */}
        <div className={`relative flex items-center justify-center ${isFullscreen ? 'my-2 sm:my-3' : 'my-4'}`}>
          {isCalling && (
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-3xl bg-[var(--action-soft)] opacity-80 blur-xl animate-pulse"
            />
          )}
          <div
            className={`relative flex items-center justify-center rounded-3xl border-3 font-mono font-black tracking-wider shadow-xl transition-all duration-200 ${
              isFullscreen
                ? 'text-7xl sm:text-8xl md:text-9xl lg:text-[7.5rem] xl:text-[9rem] 2xl:text-[10.5rem] px-8 py-3 sm:px-12 sm:py-5'
                : 'text-7xl sm:text-8xl md:text-9xl lg:text-[7rem] px-10 py-5 sm:px-14 sm:py-6'
            } ${
              isCalling
                ? 'border-[var(--action)] bg-[var(--action)] text-white scale-105 shadow-[0_10px_40px_rgba(255,122,26,0.45)]'
                : 'border-[var(--border-strong)] bg-[var(--surface-subtle)] text-[var(--text)]'
            }`}
          >
            {queueNum}
          </div>
        </div>

        {/* ─── Nama Pasien (Diperbesar Signifikan untuk Keterbacaan Jarak Jauh) ─── */}
        <div
          className={`w-full max-w-2xl rounded-2xl border-2 bg-[var(--surface-subtle)] transition-all ${
            isCalling ? 'border-[var(--action)]/60 shadow-md' : 'border-[var(--border-strong)]'
          } ${isFullscreen ? 'my-2 p-3 sm:p-4' : 'my-4 p-4 sm:p-5'}`}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[var(--text-muted)] mb-1">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[var(--action)]">
              <UserCheck className="h-4 w-4" />
              NAMA PASIEN
            </span>
            {maskPrivacy ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Privasi Terlindungi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Nama Lengkap
              </span>
            )}
          </div>
          <p className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-black tracking-tight text-[var(--text)] truncate leading-tight">
            {displayName}
          </p>
        </div>

        {/* Destination & Doctor Instructions */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl font-black text-[var(--text)]">
            <span>Silakan Menuju:</span>
            <ArrowRight className="h-5 w-5 text-[var(--action)] shrink-0" />
            <span className="text-[var(--action)] uppercase">{poliName}</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Dokter Penanggung Jawab:{' '}
            <span className="font-bold text-[var(--text)]">{doctorName}</span>
          </p>
        </div>

        {/* Interactive Recall / Voice Button */}
        {encounter && onRecall && (
          <button
            type="button"
            onClick={onRecall}
            className={`inline-flex items-center gap-2 rounded-2xl bg-[var(--action)] text-white font-black shadow-lg transition-all hover:bg-[var(--action-hover)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${
              isFullscreen
                ? 'mt-2.5 px-6 py-2 text-xs sm:text-sm'
                : 'mt-5 px-7 py-3 text-sm sm:text-base'
            }`}
          >
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Panggil Ulang Suara (Chime & Suara)</span>
          </button>
        )}
      </div>

      {/* Subtle status footer note */}
      <div
        className={`shrink-0 border-t bg-[var(--surface-subtle)] text-center text-[10px] sm:text-xs text-[var(--text-muted)] ${
          isFullscreen ? 'px-4 py-1.5' : 'px-6 py-2.5'
        }`}
      >
        {encounter ? (
          <span>
            Status: <strong className="text-[var(--text)]">{encounter.status}</strong> • Kode Booking:{' '}
            <code className="font-mono font-bold text-[var(--text)]">
              {encounter.bookingCode || 'REG-LOKAL'}
            </code>
          </span>
        ) : (
          <span>Belum ada nomor yang sedang dipanggil pada loket ini.</span>
        )}
      </div>
    </div>
  );
}
