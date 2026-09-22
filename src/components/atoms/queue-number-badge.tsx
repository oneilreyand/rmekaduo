'use client';

import React from 'react';
import type { Encounter } from '@/types/rme';

interface QueueNumberBadgeProps {
  number: string;
  status: Encounter['status'];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isCalling?: boolean;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs font-bold rounded-lg',
  md: 'px-3 py-1 text-sm font-extrabold rounded-xl',
  lg: 'px-4 py-2 text-xl font-black rounded-2xl tracking-wider',
  xl: 'px-6 py-3 text-3xl font-black rounded-3xl tracking-widest',
};

const statusClasses: Record<Encounter['status'], string> = {
  BOOKED: 'ui-status-neutral',
  ARRIVED: 'ui-status-neutral',
  IN_QUEUE: 'ui-action-soft',
  IN_CONSULTATION: 'ui-action-soft',
  PHARMACY_QUEUE: 'ui-status-warning',
  COMPLETED: 'ui-status-success',
  CANCELLED: 'ui-status-danger',
};

export function QueueNumberBadge({
  number,
  status,
  size = 'md',
  isCalling = false,
}: QueueNumberBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center border font-mono transition-colors ${sizeClasses[size]} ${statusClasses[status]} ${
        isCalling ? 'ring-2 ring-[var(--focus)]' : ''
      }`}
    >
      {number}
    </span>
  );
}
