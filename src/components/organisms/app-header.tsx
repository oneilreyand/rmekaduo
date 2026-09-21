'use client';

import { Bell, ChevronDown, Moon, Search, Settings, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export type AppMenu = 'system-ui' | 'patients' | 'encounters' | 'terminology' | 'interoperability' | 'settings';

interface AppHeaderProps {
  activeMenu: AppMenu;
  onMenuChange: (menu: AppMenu) => void;
}

export function AppHeader({ activeMenu, onMenuChange }: AppHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('rme-dark', isDarkMode);
    return () => document.documentElement.classList.remove('rme-dark');
  }, [isDarkMode]);

  return (
    <header className="sticky top-0 z-20 h-20 border-b border-stone-100 bg-white">
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2"><div aria-label="Kaduo" className="grid h-9 w-9 place-items-center rounded-xl bg-[#0b0d2c] text-base font-black text-[#ff7a1a] shadow-sm">K</div><span className="text-xl font-black tracking-tight text-[#0b0d2c]">KADUO<span className="text-[#ff7a1a]">+</span></span></div>
        <nav aria-label="Navigasi utama" className="hidden max-w-[670px] rounded-full border border-stone-100 bg-[#f8f8f8] p-1 shadow-sm lg:flex">{[
          ['patients', 'Pasien'],
          ['encounters', 'Kunjungan'],
          ['terminology', 'Terminologi'],
          ['interoperability', 'Integrasi'],
          ['settings', 'Pengaturan'],
          ['system-ui', 'Sistem UI'],
        ].map(([id, label]) => <button aria-current={activeMenu === id ? 'page' : undefined} className={`rounded-full px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a] ${activeMenu === id ? 'bg-[#ff7a1a] text-white' : 'text-[#6b6b73] hover:bg-white hover:text-[#0b0d2c]'}`} key={id} onClick={() => onMenuChange(id as AppMenu)} type="button">{label}</button>)}</nav>
        <div className="relative flex items-center justify-self-end gap-2">
          <label className="relative hidden lg:block"><span className="sr-only">Cari</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input className="h-10 w-36 rounded-full border border-stone-100 bg-[#fafafa] pl-9 pr-3 text-xs text-[#0b0d2c] outline-none focus:border-[#ff7a1a]" placeholder="Cari" /></label>
          <button aria-label="Pengaturan cepat" className="hidden h-10 w-10 place-items-center rounded-full border border-stone-100 bg-white text-stone-600 hover:bg-stone-50 sm:grid" type="button"><Settings className="h-4 w-4" /></button>
          <button aria-label={isDarkMode ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'} aria-pressed={isDarkMode} className="grid h-11 w-11 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100" onClick={() => setIsDarkMode((value) => !value)} type="button">{isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
          <button aria-label="Notifikasi" className="relative grid h-11 w-11 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100" type="button"><Bell className="h-5 w-5" /><span aria-label="19 notifikasi belum dibaca" className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#39aea9] px-1 text-[10px] font-bold text-[#0f172a]">19</span></button>
          <button aria-expanded={isProfileOpen} aria-haspopup="menu" aria-label="Menu profil pengguna" className="flex h-11 items-center gap-1 rounded-2xl border border-stone-200 bg-white py-1 pl-1 pr-2 text-sm font-bold text-[#0f172a] transition-colors hover:bg-stone-100" onClick={() => setIsProfileOpen((value) => !value)} type="button"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#39aea9]">S</span><ChevronDown className="h-4 w-4 text-stone-500" /></button>
          {isProfileOpen && <div className="absolute right-0 top-14 z-30 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl" role="menu"><p className="px-3 py-2 text-xs font-semibold text-stone-400">PROFIL PENGGUNA</p><button className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-100" role="menuitem" type="button">Pengaturan profil</button><button className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-100" role="menuitem" type="button">Keluar</button></div>}
        </div>
      </div>
    </header>
  );
}
