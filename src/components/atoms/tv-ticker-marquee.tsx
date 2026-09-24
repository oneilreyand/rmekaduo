'use client';

import React from 'react';
import { HeartPulse, Bell, ShieldCheck, Clock, Sparkles } from 'lucide-react';

interface TickerItem {
  icon: React.ElementType;
  text: string;
}

const defaultAnnouncements: TickerItem[] = [
  {
    icon: Sparkles,
    text: 'Selamat datang di Klinik Pratama Kaduo Sehat. Layanan rekam medis terpadu & bridging BPJS Antrol v2.',
  },
  {
    icon: Bell,
    text: 'Peserta Mobile JKN: Pastikan telah melakukan check-in mandiri via geolokasi MJKN (<1 km) atau scan barcode di Kiosk Lobby.',
  },
  {
    icon: ShieldCheck,
    text: 'Mohon persiapkan identitas diri (e-KTP & Kartu BPJS/Asuransi) saat nomor antrean Anda dipanggil ke loket pendaftaran.',
  },
  {
    icon: HeartPulse,
    text: 'Bagi pasien dengan gejala batuk, flu, atau demam diimbau mengenakan masker dan menjaga etika batuk di ruang tunggu.',
  },
  {
    icon: Clock,
    text: 'Jam Layanan Poliklinik Rawat Jalan: Sesi Pagi 08:00 - 13:00 WIB | Sesi Sore 16:00 - 20:30 WIB.',
  },
];

interface TVTickerMarqueeProps {
  items?: TickerItem[];
}

export function TVTickerMarquee({ items = defaultAnnouncements }: TVTickerMarqueeProps) {
  return (
    <div
      aria-label="Informasi dan Pengumuman Layanan"
      className="ui-surface flex h-11 w-full items-center overflow-hidden border-t px-2 shadow-inner"
    >
      <div className="ui-action shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-xs">
        <Bell className="h-3.5 w-3.5 animate-pulse" />
        <span className="uppercase tracking-wider">INFORMASI</span>
      </div>

      <div className="relative flex flex-1 overflow-hidden ml-3">
        <div className="flex animate-marquee whitespace-nowrap py-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <span key={`ticker-1-${idx}`} className="mx-6 inline-flex items-center gap-2 text-xs font-medium text-[var(--text)]">
                <Icon className="h-3.5 w-3.5 text-[var(--action)] shrink-0" />
                <span>{item.text}</span>
                <span className="text-[var(--border-strong)] ml-4">•</span>
              </span>
            );
          })}
        </div>
        <div className="flex absolute top-0 animate-marquee2 whitespace-nowrap py-1">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <span key={`ticker-2-${idx}`} className="mx-6 inline-flex items-center gap-2 text-xs font-medium text-[var(--text)]">
                <Icon className="h-3.5 w-3.5 text-[var(--action)] shrink-0" />
                <span>{item.text}</span>
                <span className="text-[var(--border-strong)] ml-4">•</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
