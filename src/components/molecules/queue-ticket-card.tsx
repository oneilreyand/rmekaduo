'use client';

import { ArrowRight, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { QueueNumberBadge } from '@/components/atoms/queue-number-badge';
import type { Encounter } from '@/types/rme';

interface QueueTicketCardProps {
  encounter: Encounter;
  onAction?: () => void;
  actionLabel?: string;
  isCalling?: boolean;
}

const statusLabels: Record<Encounter['status'], string> = {
  BOOKED: 'Terdaftar',
  ARRIVED: 'Hadir',
  IN_QUEUE: 'Menunggu',
  IN_CONSULTATION: 'Konsultasi',
  PHARMACY_QUEUE: 'Farmasi',
  COMPLETED: 'Selesai lokal',
  CANCELLED: 'Dibatalkan',
};

export function QueueTicketCard({ encounter, onAction, actionLabel = 'Pilih', isCalling = false }: QueueTicketCardProps) {
  const patient = encounter.patient;

  return (
    <article className={`ui-card flex items-center justify-between gap-3 rounded-2xl p-4 ${isCalling ? 'ui-row-selected' : ''}`}>
      <div className="flex min-w-0 items-center gap-3">
        <QueueNumberBadge number={encounter.queueNumber} status={encounter.status} size="md" isCalling={isCalling} />
        <div className="min-w-0">
          <h4 className="ui-heading truncate text-sm font-bold">{patient?.name || 'Pasien contoh'}</h4>
          <p className="ui-copy mt-0.5 text-xs">{statusLabels[encounter.status]} · {encounter.poliName}</p>
          {patient?.allergies?.length ? (
            <p className="ui-text-danger mt-1 inline-flex items-center gap-1 text-xs font-semibold">
              <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" /> Alergi: {patient.allergies.map((item) => item.substance).join(', ')}
            </p>
          ) : null}
        </div>
      </div>
      {onAction ? <Button size="sm" onClick={onAction}>{actionLabel}<ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Button> : null}
    </article>
  );
}
