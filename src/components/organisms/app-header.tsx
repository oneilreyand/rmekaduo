'use client';

import { Bell, ChevronDown, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export type AppMenu =
  | 'admission'
  | 'queue-display'
  | 'triage'
  | 'consultation'
  | 'pharmacy-cashier'
  | 'system-ui'
  | 'settings';

interface AppHeaderProps {
  activeMenu: AppMenu;
  onMenuChange: (menu: AppMenu) => void;
}

/** Shared nav button — avoids duplicating className logic */
function NavButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
        active
          ? 'ui-action shadow-sm'
          : 'ui-ghost'
      }`}
    >
      {label}
    </button>
  );
}

export function AppHeader({ activeMenu, onMenuChange }: AppHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('rme-dark', isDarkMode);
    return () => document.documentElement.classList.remove('rme-dark');
  }, [isDarkMode]);

  /** Shared action controls: theme, notifications, and profile. */
  const actionBar = (
    <div className="relative flex shrink-0 items-center gap-2">
      <button
        type="button"
        aria-label={isDarkMode ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
        aria-checked={isDarkMode}
        onClick={() => setIsDarkMode((v) => !v)}
        className="ui-theme-switch relative grid h-9 w-[4.5rem] shrink-0 place-items-center rounded-full transition-colors sm:h-10"
        role="switch"
      >
        <span aria-hidden="true" className={`ui-theme-switch-thumb absolute left-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full transition-transform duration-200 ease-out sm:h-8 sm:w-8 ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}`}>
          {isDarkMode ? <Moon className="h-3.5 w-3.5 text-[var(--action)]" /> : <Sun className="h-3.5 w-3.5 text-[var(--action)]" />}
        </span>
      </button>

      <button
        type="button"
        aria-label="Pemberitahuan klinis"
        className="ui-icon-button relative grid h-9 w-9 place-items-center rounded-xl shadow-xs transition-colors sm:h-10 sm:w-10"
      >
        <Bell className="h-4 w-4" />
        <span
          aria-label="3 pesan sistem belum dibaca"
          className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white shadow-xs"
        >
          3
        </span>
      </button>

      <button
        type="button"
        aria-expanded={isProfileOpen}
        aria-haspopup="menu"
        aria-label="Menu profil dokter"
        onClick={() => setIsProfileOpen((v) => !v)}
        className="ui-icon-button flex h-9 items-center gap-1.5 rounded-xl py-1 pl-1.5 pr-2 shadow-xs transition-colors sm:h-10 sm:gap-2 sm:pr-2.5"
      >
        <div className="ui-action-soft grid h-6 w-6 place-items-center rounded-lg text-xs font-bold sm:h-7 sm:w-7">
          DR
        </div>
        <div className="hidden text-left sm:block">
          <p className="ui-heading text-xs font-bold leading-tight">
            dr. Sarah
          </p>
          <p className="ui-copy text-[10px] leading-none">
            Dokter Penanggung Jawab
          </p>
        </div>
        <ChevronDown className="ui-copy h-3.5 w-3.5" />
      </button>

      {isProfileOpen && (
        <div
          role="menu"
          className="ui-card absolute right-0 top-11 z-30 w-56 rounded-2xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 sm:top-12"
        >
          <div className="border-b px-3 py-2">
            <p className="ui-heading text-xs font-bold">
              dr. Sarah Amalia, Sp.PD
            </p>
            <p className="ui-copy text-[10px]">
              Profil pengguna contoh
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            className="ui-ghost w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
          >
            Profil contoh
          </button>
          <button
            type="button"
            role="menuitem"
            className="ui-ghost w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
          >
            Preferensi tampilan
          </button>
          <button
            type="button"
            role="menuitem"
            className="ui-status-danger w-full rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors"
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );

  /** Brand / clinic identity block */
  const brand = (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        aria-label="Kaduo"
        className="ui-brand grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black sm:h-11 sm:w-11 sm:rounded-2xl"
      >
        K
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="ui-heading truncate text-sm font-black tracking-tight sm:text-base">
            KADUO<span className="ui-eyebrow">+</span>
          </span>
          <span className="ui-action-soft hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:inline">
            RME Klinik
          </span>
        </div>
        <p className="ui-copy hidden text-[11px] font-medium sm:block">
          Klinik Kaduo • Poli Umum
        </p>
      </div>
    </div>
  );

  /** Inline nav pills container */
  const navPills = (desktop?: boolean) => (
    <nav
      aria-label="Navigasi modul RME"
      className={
        desktop
          ? 'ui-surface-subtle flex items-center rounded-full border p-1 shadow-xs overflow-x-auto max-w-full'
          : 'flex items-center gap-1 overflow-x-auto py-2 scrollbar-none'
      }
    >
      <NavButton
        label="Admisi"
        active={activeMenu === 'admission'}
        onClick={() => onMenuChange('admission')}
      />
      <NavButton
        label="TV Antrean"
        active={activeMenu === 'queue-display'}
        onClick={() => onMenuChange('queue-display')}
      />
      <NavButton
        label="Triase"
        active={activeMenu === 'triage'}
        onClick={() => onMenuChange('triage')}
      />
      <NavButton
        label="Konsultasi"
        active={activeMenu === 'consultation'}
        onClick={() => onMenuChange('consultation')}
      />
      <NavButton
        label="Farmasi & Kasir"
        active={activeMenu === 'pharmacy-cashier'}
        onClick={() => onMenuChange('pharmacy-cashier')}
      />
      <NavButton
        label="Katalog"
        active={activeMenu === 'system-ui'}
        onClick={() => onMenuChange('system-ui')}
      />
      <NavButton
        label="Pengaturan"
        active={activeMenu === 'settings'}
        onClick={() => onMenuChange('settings')}
      />
    </nav>
  );

  return (
    <header className="ui-surface sticky top-0 z-20 border-b backdrop-blur-md">

      {/* ─── MOBILE / TABLET layout (< lg) ─── */}
      <div className="lg:hidden">
        {/* Row 1: brand + action bar */}
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          {brand}
          {actionBar}
        </div>

        {/* Row 2: scrollable nav pills */}
        <div className="border-t px-4 sm:flex sm:justify-center sm:px-6">
          {navPills(false)}
        </div>
      </div>

      {/* ─── DESKTOP layout (lg+): single row 3-column ─── */}
      <div className="hidden lg:grid lg:h-20 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 lg:px-8">
        {brand}
        {navPills(true)}
        <div className="flex justify-end">{actionBar}</div>
      </div>
    </header>
  );
}
