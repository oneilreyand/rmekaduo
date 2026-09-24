'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  Radio,
  Volume1,
  Tv,
  Layers,
} from 'lucide-react';

import { usePatientJourney } from '@/context/patient-journey-context';
import { tvSoundManager } from '@/lib/tv-sound-chime';
import { TVTickerMarquee } from '@/components/atoms/tv-ticker-marquee';
import { TVHeroCallCard } from '@/components/molecules/tv-hero-call-card';
import { TVCounterCard } from '@/components/molecules/tv-counter-card';
import { TVUpcomingList } from '@/components/molecules/tv-upcoming-list';
import type { Encounter } from '@/types/rme';

type CounterFilter = 'ALL' | 'POLI_UMUM' | 'POLI_GIGI' | 'POLI_KIA' | 'PHARMACY' | 'ADMISSION';

export function QueueDisplayWorkspace() {
  const { encounters } = usePatientJourney();
  const containerRef = useRef<HTMLDivElement>(null);

  // Time & Date state
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');

  // TV Controls state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [maskPrivacy, setMaskPrivacy] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<CounterFilter>('ALL');
  const [focusedPoli, setFocusedPoli] = useState<'POLI_UMUM' | 'POLI_GIGI' | 'POLI_KIA' | 'PHARMACY' | 'ADMISSION'>('POLI_UMUM');
  const [isCalling, setIsCalling] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState<string | null>(null);

  // Clock interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(now) + ' WIB'
      );
      setDateStr(
        new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(now)
      );
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback for browsers with strict fullscreen restrictions
      setIsFullscreen((prev) => !prev);
    }
  };

  // ─── Group & Compute Encounters across Multi-Poli ───
  // Poli Umum (Prefix A)
  const poliUmumInConsultation = encounters.find((e) => e.poliCode === 'POLI_UMUM' && e.status === 'IN_CONSULTATION');
  const poliUmumWaiting = encounters.filter((e) => e.poliCode === 'POLI_UMUM' && e.status === 'IN_QUEUE');
  const currentPoliUmum = poliUmumInConsultation || poliUmumWaiting[0] || null;

  // Poli Gigi & Mulut (Prefix B)
  const poliGigiInConsultation = encounters.find((e) => e.poliCode === 'POLI_GIGI' && e.status === 'IN_CONSULTATION');
  const poliGigiWaiting = encounters.filter((e) => e.poliCode === 'POLI_GIGI' && e.status === 'IN_QUEUE');
  const currentPoliGigi = poliGigiInConsultation || poliGigiWaiting[0] || null;

  // Poli KIA & Anak (Prefix C)
  const poliKiaInConsultation = encounters.find((e) => e.poliCode === 'POLI_KIA' && e.status === 'IN_CONSULTATION');
  const poliKiaWaiting = encounters.filter((e) => e.poliCode === 'POLI_KIA' && e.status === 'IN_QUEUE');
  const currentPoliKia = poliKiaInConsultation || poliKiaWaiting[0] || null;

  // Loket Farmasi (Prefix F)
  const inPharmacy = encounters.filter((e) => e.status === 'PHARMACY_QUEUE');
  const currentPharmacy = inPharmacy[0] || null;

  // Loket Admisi & BPJS (Prefix R)
  const inAdmission = encounters.filter((e) => e.status === 'BOOKED');
  const currentAdmission = inAdmission[0] || null;

  // Global counts
  const allActiveConsultation = encounters.filter((e) => e.status === 'IN_CONSULTATION');
  const allWaitingQueues = encounters.filter((e) => ['IN_QUEUE', 'BOOKED'].includes(e.status));
  const completedList = encounters.filter((e) => e.status === 'COMPLETED');

  // Determine active unit for Hero Display based on filter or selection
  const activeTargetPoli = selectedFilter === 'ALL' ? focusedPoli : selectedFilter;

  let heroEncounter: Encounter | null = currentPoliUmum;
  let heroCounterTitle = 'Poli Umum';
  let heroRoom = 'Ruang Periksa 1';

  if (activeTargetPoli === 'POLI_GIGI') {
    heroEncounter = currentPoliGigi;
    heroCounterTitle = 'Poli Gigi & Mulut';
    heroRoom = 'Ruang Periksa 2';
  } else if (activeTargetPoli === 'POLI_KIA') {
    heroEncounter = currentPoliKia;
    heroCounterTitle = 'Poli KIA & Anak';
    heroRoom = 'Ruang Periksa 3';
  } else if (activeTargetPoli === 'PHARMACY') {
    heroEncounter = currentPharmacy;
    heroCounterTitle = 'Loket Farmasi';
    heroRoom = 'Loket Penyerahan Obat';
  } else if (activeTargetPoli === 'ADMISSION') {
    heroEncounter = currentAdmission;
    heroCounterTitle = 'Loket Pendaftaran & BPJS';
    heroRoom = 'Loket 1 Admisi';
  }

  // Upcoming list filtered appropriately
  const upcomingQueueList = encounters.filter((e) => {
    if (['COMPLETED', 'CANCELLED'].includes(e.status) || e.id === heroEncounter?.id) return false;
    if (selectedFilter === 'POLI_UMUM') return e.poliCode === 'POLI_UMUM';
    if (selectedFilter === 'POLI_GIGI') return e.poliCode === 'POLI_GIGI';
    if (selectedFilter === 'POLI_KIA') return e.poliCode === 'POLI_KIA';
    if (selectedFilter === 'PHARMACY') return e.status === 'PHARMACY_QUEUE';
    if (selectedFilter === 'ADMISSION') return e.status === 'BOOKED';
    return true;
  });

  // Trigger recall sound and speech
  const handleRecall = async () => {
    if (!heroEncounter) return;

    setIsCalling(true);
    const msg = `Panggilan antrean ${heroEncounter.queueNumber} menuju ${heroCounterTitle}.`;
    setAnnouncementMsg(msg);

    if (audioEnabled) {
      await tvSoundManager.callQueueNumber({
        queueNumber: heroEncounter.queueNumber,
        counterName: heroCounterTitle,
        roomName: heroRoom,
        withChime: true,
      });
    }

    setTimeout(() => {
      setIsCalling(false);
    }, 4500);
  };

  const handleSelectPoli = (poli: typeof focusedPoli) => {
    setFocusedPoli(poli);
    if (selectedFilter !== 'ALL') {
      setSelectedFilter(poli);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`ui-workspace text-[var(--text)] transition-colors ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen overflow-hidden p-2 sm:p-3 lg:p-4 bg-[var(--canvas)] flex flex-col justify-between'
          : 'flex flex-col justify-between'
      }`}
    >
      <div
        className={`${
          isFullscreen
            ? 'w-full h-full max-w-none flex flex-col justify-between flex-1 min-h-0 overflow-hidden space-y-2'
            : 'ui-workspace-inner space-y-4'
        }`}
      >
        {/* ─── 1. TV Clinic Header Bar ─── */}
        <header
          className={`ui-card flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-3xl shadow-sm ${
            isFullscreen ? 'px-4 py-2 sm:px-5 sm:py-2.5' : 'p-4 sm:p-5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`shrink-0 place-items-center rounded-2xl bg-[var(--action)] text-white shadow-md grid ${
                isFullscreen ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-12 w-12'
              }`}
            >
              <Building2 className={isFullscreen ? 'h-5 w-5' : 'h-6 w-6'} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={`font-black tracking-tight text-[var(--text)] ${
                    isFullscreen ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                  }`}
                >
                  KLINIK KADUO SEHAT
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  <Radio className="h-3 w-3 animate-pulse" />
                  BPJS Antrol v2 Online
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--action-soft)] px-2.5 py-0.5 text-[10px] font-black text-[var(--action)]">
                  <Layers className="h-3 w-3" />
                  Layanan Multi-Poli
                </span>
                {isFullscreen && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <Tv className="h-3 w-3" />
                    Kiosk 16:9
                  </span>
                )}
              </div>
              <p className={`text-[var(--text-muted)] ${isFullscreen ? 'text-[11px]' : 'text-xs'}`}>
                Display Antrean Terpadu Multi-Poli Rawat Jalan & Farmasi • {dateStr}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div
              className={`rounded-2xl border bg-[var(--surface-subtle)] text-right ${
                isFullscreen ? 'px-3 py-1 sm:px-4 sm:py-1.5' : 'px-4 py-2'
              }`}
            >
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                WAKTU SERVER
              </span>
              <time
                className={`font-mono font-black text-[var(--action)] ${
                  isFullscreen ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                }`}
              >
                {time}
              </time>
            </div>

            {/* Quick TV Control Action Buttons */}
            <div className="flex items-center gap-1.5 rounded-2xl border bg-[var(--surface-subtle)] p-1">
              <button
                type="button"
                onClick={() => setAudioEnabled((prev) => !prev)}
                aria-label={audioEnabled ? 'Matikan Suara TV' : 'Nyalakan Suara TV'}
                title={audioEnabled ? 'Suara Aktif (Ding-dong & Suara)' : 'Suara Mati'}
                className={`grid h-8 w-8 place-items-center rounded-xl transition-all ${
                  audioEnabled ? 'ui-action text-white shadow-xs' : 'ui-ghost text-[var(--text-muted)]'
                }`}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => setMaskPrivacy((prev) => !prev)}
                aria-label={maskPrivacy ? 'Tampilkan Nama Lengkap' : 'Sensor Nama (Privasi Pasien)'}
                title={maskPrivacy ? 'Privasi Aktif (Nama Disamarkan)' : 'Nama Lengkap'}
                className={`grid h-8 w-8 place-items-center rounded-xl transition-all ${
                  maskPrivacy ? 'ui-action text-white shadow-xs' : 'ui-ghost text-[var(--text-muted)]'
                }`}
              >
                {maskPrivacy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Mode TV Layar Penuh (Kiosk)'}
                title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh TV Kiosk'}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  isFullscreen
                    ? 'bg-rose-500 text-white shadow-xs hover:bg-rose-600'
                    : 'ui-ghost hover:ui-action text-[var(--text)]'
                }`}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span>{isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh TV'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* ─── 2. Service Filter & Quick Live Stats Ribbon ─── */}
        <section
          aria-label="Statistik dan Filter Layanan"
          className={`grid shrink-0 gap-2 sm:grid-cols-2 lg:grid-cols-4 ${
            isFullscreen ? 'gap-2' : 'gap-3'
          }`}
        >
          <div
            className={`ui-card flex items-center justify-between rounded-2xl border ${
              isFullscreen ? 'p-2 sm:p-2.5' : 'p-3.5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`grid place-items-center rounded-xl bg-blue-500/10 text-blue-600 ${
                  isFullscreen ? 'h-7 w-7' : 'h-9 w-9'
                }`}
              >
                <Users className={isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Total Antrean
                </p>
                <p
                  className={`font-black text-[var(--text)] leading-none ${
                    isFullscreen ? 'text-base' : 'text-lg'
                  }`}
                >
                  {encounters.length}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-[var(--text-muted)]">Hari Ini</span>
          </div>

          <div
            className={`ui-card flex items-center justify-between rounded-2xl border ${
              isFullscreen ? 'p-2 sm:p-2.5' : 'p-3.5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`grid place-items-center rounded-xl bg-amber-500/10 text-amber-600 ${
                  isFullscreen ? 'h-7 w-7' : 'h-9 w-9'
                }`}
              >
                <Activity className={isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Sedang Dilayani
                </p>
                <p
                  className={`font-black text-amber-600 leading-none ${
                    isFullscreen ? 'text-base' : 'text-lg'
                  }`}
                >
                  {allActiveConsultation.length + (inPharmacy.length > 0 ? 1 : 0)}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-[var(--text-muted)]">Aktif</span>
          </div>

          <div
            className={`ui-card flex items-center justify-between rounded-2xl border ${
              isFullscreen ? 'p-2 sm:p-2.5' : 'p-3.5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`grid place-items-center rounded-xl bg-[var(--action-soft)] text-[var(--action)] ${
                  isFullscreen ? 'h-7 w-7' : 'h-9 w-9'
                }`}
              >
                <Clock className={isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Sisa Menunggu
                </p>
                <p
                  className={`font-black text-[var(--action)] leading-none ${
                    isFullscreen ? 'text-base' : 'text-lg'
                  }`}
                >
                  {allWaitingQueues.length}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-[var(--text-muted)]">Di Antrean</span>
          </div>

          <div
            className={`ui-card flex items-center justify-between rounded-2xl border ${
              isFullscreen ? 'p-2 sm:p-2.5' : 'p-3.5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 ${
                  isFullscreen ? 'h-7 w-7' : 'h-9 w-9'
                }`}
              >
                <CheckCircle2 className={isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Selesai
                </p>
                <p
                  className={`font-black text-emerald-600 leading-none ${
                    isFullscreen ? 'text-base' : 'text-lg'
                  }`}
                >
                  {completedList.length}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-[var(--text-muted)]">Terlayani</span>
          </div>
        </section>

        {/* ─── 3. Multi-Poli Filter Navigation Tabs ─── */}
        <div
          className={`flex shrink-0 flex-wrap items-center justify-between gap-2 border-b ${
            isFullscreen ? 'pb-1' : 'pb-2'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                selectedFilter === 'ALL'
                  ? 'ui-action text-white shadow-xs'
                  : 'ui-ghost text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Semua Poli (Multi-Poli)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedFilter('POLI_UMUM'); setFocusedPoli('POLI_UMUM'); }}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                selectedFilter === 'POLI_UMUM'
                  ? 'ui-action text-white shadow-xs'
                  : 'ui-ghost text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Poli Umum (A)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedFilter('POLI_GIGI'); setFocusedPoli('POLI_GIGI'); }}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                selectedFilter === 'POLI_GIGI'
                  ? 'ui-action text-white shadow-xs'
                  : 'ui-ghost text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Poli Gigi (B)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedFilter('POLI_KIA'); setFocusedPoli('POLI_KIA'); }}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                selectedFilter === 'POLI_KIA'
                  ? 'ui-action text-white shadow-xs'
                  : 'ui-ghost text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Poli KIA / Anak (C)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedFilter('PHARMACY'); setFocusedPoli('PHARMACY'); }}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                selectedFilter === 'PHARMACY'
                  ? 'ui-action text-white shadow-xs'
                  : 'ui-ghost text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Farmasi (F)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedFilter('ADMISSION'); setFocusedPoli('ADMISSION'); }}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                selectedFilter === 'ADMISSION'
                  ? 'ui-action text-white shadow-xs'
                  : 'ui-ghost text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Admisi (R)
            </button>
          </div>

          {announcementMsg && (
            <div
              role="status"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in"
            >
              <Volume1 className="h-3.5 w-3.5" />
              <span>{announcementMsg}</span>
            </div>
          )}
        </div>

        {/* ─── 4. Main 16:9 Display Grid ─── */}
        <div
          className={`grid items-stretch overflow-hidden ${
            isFullscreen
              ? 'flex-1 min-h-0 grid-cols-1 md:grid-cols-12 gap-2 lg:gap-3'
              : 'gap-5 lg:grid-cols-12'
          }`}
        >
          {/* Sisi Kiri / Hero Calling Showcase (Nomor & Nama Pasien Super Besar) */}
          <section
            aria-label="Panggilan Antrean Utama"
            className={`flex flex-col min-h-0 overflow-hidden ${
              isFullscreen
                ? 'md:col-span-7 h-full justify-between'
                : 'lg:col-span-6 xl:col-span-7 space-y-4'
            }`}
          >
            <TVHeroCallCard
              encounter={heroEncounter}
              isCalling={isCalling}
              maskPrivacy={maskPrivacy}
              onRecall={handleRecall}
              counterLabel={heroCounterTitle}
              roomLabel={heroRoom}
              isFullscreen={isFullscreen}
            />

            {/* Quick Demo Guidance Note (Only in regular view, hidden in fullscreen) */}
            {!isFullscreen && (
              <div className="ui-demo-note p-3.5 rounded-2xl flex items-start gap-2.5">
                <Radio className="h-4 w-4 text-[var(--action)] shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-[var(--text)]">Simulasi Antrean Multi-Poli</p>
                  <p className="text-[var(--text-muted)]">
                    Klik kartu poli di sisi kanan untuk memfokuskan panggilan nomor dan nama pasien pada layar utama. Suara lonceng 2-nada dan text-to-speech akan menyesuaikan dengan poli yang dipanggil.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Sisi Kanan / Multi-Poli Board & Antrean Berikutnya */}
          <section
            aria-label="Papan Status Multi-Poli dan Antrean Berikutnya"
            className={`flex flex-col min-h-0 overflow-hidden justify-between ${
              isFullscreen
                ? 'md:col-span-5 h-full gap-2'
                : 'lg:col-span-6 xl:col-span-5 space-y-4'
            }`}
          >
            {/* Multi-Poli Grid Cards */}
            <div
              className={`grid shrink-0 gap-1.5 sm:gap-2 ${
                isFullscreen
                  ? 'grid-cols-3'
                  : 'gap-3 sm:grid-cols-2 lg:grid-cols-1'
              }`}
            >
              <TVCounterCard
                type="POLI"
                title="Poli Umum"
                roomName="Ruang 1"
                currentEncounter={currentPoliUmum}
                waitingCount={poliUmumWaiting.length}
                officerOrDoctor="dr. Siti, Sp.PD"
                isActive={activeTargetPoli === 'POLI_UMUM'}
                isCompact={isFullscreen}
                onSelect={() => handleSelectPoli('POLI_UMUM')}
              />

              <TVCounterCard
                type="POLI_GIGI"
                title="Poli Gigi"
                roomName="Ruang 2"
                currentEncounter={currentPoliGigi}
                waitingCount={poliGigiWaiting.length}
                officerOrDoctor="drg. Ahmad"
                isActive={activeTargetPoli === 'POLI_GIGI'}
                isCompact={isFullscreen}
                onSelect={() => handleSelectPoli('POLI_GIGI')}
              />

              <TVCounterCard
                type="POLI_KIA"
                title="Poli KIA/Anak"
                roomName="Ruang 3"
                currentEncounter={currentPoliKia}
                waitingCount={poliKiaWaiting.length}
                officerOrDoctor="dr. Rina, Sp.A"
                isActive={activeTargetPoli === 'POLI_KIA'}
                isCompact={isFullscreen}
                onSelect={() => handleSelectPoli('POLI_KIA')}
              />

              <TVCounterCard
                type="PHARMACY"
                title="Farmasi"
                roomName="Loket Obat"
                currentEncounter={currentPharmacy}
                waitingCount={inPharmacy.length}
                officerOrDoctor="Apt. Dewi"
                isActive={activeTargetPoli === 'PHARMACY'}
                isCompact={isFullscreen}
                onSelect={() => handleSelectPoli('PHARMACY')}
              />

              <TVCounterCard
                type="ADMISSION"
                title="Admisi"
                roomName="Loket 1"
                currentEncounter={currentAdmission}
                waitingCount={inAdmission.length}
                officerOrDoctor="Petugas"
                isActive={activeTargetPoli === 'ADMISSION'}
                isCompact={isFullscreen}
                onSelect={() => handleSelectPoli('ADMISSION')}
              />
            </div>

            {/* Antrean Berikutnya List */}
            <TVUpcomingList
              encounters={upcomingQueueList}
              maskPrivacy={maskPrivacy}
              isFullscreen={isFullscreen}
              maxItems={isFullscreen ? 3 : 6}
            />
          </section>
        </div>
      </div>

      {/* ─── 5. Bottom Running Text Ticker ─── */}
      <footer className="mt-2 shrink-0">
        <TVTickerMarquee />
      </footer>
    </div>
  );
}
