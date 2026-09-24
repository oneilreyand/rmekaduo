'use client';

import React from 'react';
import { Clock, Smartphone, Building2, User } from 'lucide-react';
import type { Encounter } from '@/types/rme';
import { QueueNumberBadge } from '@/components/atoms/queue-number-badge';
import { maskPatientName } from '@/lib/tv-sound-chime';

interface TVUpcomingListProps {
  encounters: Encounter[];
  maskPrivacy?: boolean;
  isFullscreen?: boolean;
  maxItems?: number;
}

export function TVUpcomingList({
  encounters,
  maskPrivacy = true,
  isFullscreen = false,
  maxItems,
}: TVUpcomingListProps) {
  if (!encounters || encounters.length === 0) {
    return (
      <div className="ui-card flex flex-1 flex-col items-center justify-center rounded-2xl p-6 text-center">
        <Clock className="h-8 w-8 text-[var(--text-muted)] opacity-50" />
        <p className="mt-2 text-xs font-semibold text-[var(--text)]">Tidak Ada Antrean Menunggu</p>
        <p className="text-[11px] text-[var(--text-muted)]">Semua pasien pada sesi ini telah dilayani.</p>
      </div>
    );
  }

  // Limit items in fullscreen so there is strictly NO internal scrollbar
  const limit = maxItems || (isFullscreen ? 3 : 6);
  const visibleList = encounters.slice(0, limit);
  const remainingCount = encounters.length - visibleList.length;

  return (
    <div
      className={`ui-card flex flex-col justify-between rounded-2xl border ${
        isFullscreen ? 'flex-1 min-h-0 overflow-hidden' : 'overflow-hidden'
      }`}
    >
      <div
        className={`ui-surface-subtle flex shrink-0 items-center justify-between border-b ${
          isFullscreen ? 'px-3 py-2' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--action)]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">
            ANTREAN BERIKUTNYA
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[var(--text-muted)]">
          {encounters.length} Menunggu
        </span>
      </div>

      <div
        className={`divide-y ${
          isFullscreen ? 'flex-1 min-h-0 overflow-hidden flex flex-col justify-around' : 'max-h-[360px] overflow-y-auto'
        }`}
      >
        {visibleList.map((enc, idx) => {
          const isMjkn = enc.bookingSource === 'MOBILE_JKN';
          const patientName = enc.patient?.name;
          const displayName = maskPrivacy ? maskPatientName(patientName) : (patientName || 'Pasien');

          return (
            <div
              key={enc.id}
              className={`flex items-center justify-between gap-2 transition-colors hover:bg-[var(--surface-subtle)] ${
                isFullscreen ? 'px-3 py-2 sm:py-2.5' : 'p-3'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-bold text-[var(--text-muted)] w-5 text-center shrink-0">
                  #{idx + 1}
                </span>
                <QueueNumberBadge number={enc.queueNumber} status={enc.status} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                    <span className="truncate text-xs font-bold text-[var(--text)]">
                      {displayName}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">
                    {enc.poliName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-0.5 text-right">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                    isMjkn
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isMjkn ? <Smartphone className="h-2.5 w-2.5" /> : <Building2 className="h-2.5 w-2.5" />}
                  {isMjkn ? 'Mobile JKN' : 'On-Site'}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] font-mono">
                  {enc.checkInStatus === 'CHECKED_IN' ? '✓ Hadir di Faskes' : 'Menunggu Check-in'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {remainingCount > 0 && (
        <div className="border-t bg-[var(--surface-subtle)] px-3 py-1.5 text-center text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
          + {remainingCount} antrean berikutnya dalam antrean
        </div>
      )}
    </div>
  );
}
