'use client';

import React from 'react';
import { Stethoscope, Pill, ClipboardList, Users, Smile, Baby } from 'lucide-react';
import type { Encounter } from '@/types/rme';

export type TVCounterType = 'POLI' | 'POLI_GIGI' | 'POLI_KIA' | 'PHARMACY' | 'ADMISSION';

interface TVCounterCardProps {
  type: TVCounterType;
  title: string;
  roomName: string;
  currentEncounter?: Encounter | null;
  waitingCount: number;
  officerOrDoctor: string;
  isActive?: boolean;
  isCompact?: boolean;
  onSelect?: () => void;
}

const typeIcons: Record<TVCounterType, React.ElementType> = {
  POLI: Stethoscope,
  POLI_GIGI: Smile,
  POLI_KIA: Baby,
  PHARMACY: Pill,
  ADMISSION: ClipboardList,
};

export function TVCounterCard({
  type,
  title,
  roomName,
  currentEncounter,
  waitingCount,
  officerOrDoctor,
  isActive = false,
  isCompact = false,
  onSelect,
}: TVCounterCardProps) {
  const Icon = typeIcons[type] || Stethoscope;

  return (
    <article
      onClick={onSelect}
      className={`ui-card relative flex flex-col justify-between rounded-2xl border transition-all duration-200 ${
        isCompact ? 'p-2.5 sm:p-3' : 'p-4'
      } ${
        isActive
          ? 'border-[var(--action)] bg-[var(--action-soft)]/20 shadow-md ring-2 ring-[var(--action)]'
          : 'hover:border-[var(--border-strong)]'
      } ${onSelect ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`grid shrink-0 place-items-center rounded-xl bg-[var(--surface-subtle)] text-[var(--action)] border ${
                isCompact ? 'h-7 w-7' : 'h-8 w-8'
              }`}
            >
              <Icon className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </div>
            <div className="min-w-0">
              <h3
                className={`font-black uppercase tracking-wider text-[var(--text)] truncate ${
                  isCompact ? 'text-[11px]' : 'text-xs'
                }`}
              >
                {title}
              </h3>
              <p className={`text-[var(--text-muted)] truncate ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
                {roomName}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold ${
              isCompact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
            } ${
              currentEncounter
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
            }`}
          >
            <span
              className={`rounded-full ${isCompact ? 'h-1 w-1' : 'h-1.5 w-1.5'} ${
                currentEncounter ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
            {currentEncounter ? 'Melayani' : 'Siap'}
          </span>
        </div>

        <div className={`rounded-xl border bg-[var(--surface)] text-center ${isCompact ? 'my-2 p-2' : 'my-3 p-3'}`}>
          <span
            className={`block font-bold uppercase tracking-widest text-[var(--text-muted)] ${
              isCompact ? 'text-[9px]' : 'text-[10px]'
            }`}
          >
            Nomor Panggilan
          </span>
          <p
            className={`font-mono font-black tracking-wider text-[var(--action)] ${
              isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            {currentEncounter?.queueNumber || '—'}
          </p>
          <p className={`truncate text-[var(--text-muted)] font-medium ${isCompact ? 'text-[10px] mt-0.5' : 'text-xs mt-0.5'}`}>
            {currentEncounter?.patient?.name
              ? `Pasien: ${currentEncounter.patient.name.split(' ')[0]}`
              : 'Tidak ada panggilan'}
          </p>
        </div>
      </div>

      <div
        className={`flex items-center justify-between border-t text-[var(--text-muted)] ${
          isCompact ? 'pt-1.5 text-[10px]' : 'pt-2.5 text-xs'
        }`}
      >
        <span className="truncate max-w-[120px] font-medium">{officerOrDoctor}</span>
        <span className="inline-flex items-center gap-1 font-bold text-[var(--text)]">
          <Users className={isCompact ? 'h-2.5 w-2.5 text-[var(--action)]' : 'h-3 w-3 text-[var(--action)]'} />
          <span>Sisa: {waitingCount}</span>
        </span>
      </div>
    </article>
  );
}
