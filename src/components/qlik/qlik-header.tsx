'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Grid,
  Search,
  Plus,
  Bell,
  HelpCircle,
  ChevronDown,
  X,
  Stethoscope,
  Smartphone,
  Pill,
  BarChart3,
  Share2,
  Settings,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  LogOut,
  Sliders,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

interface QlikHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onSelectAppById: (appId: string) => void;
  activeStreamName: string;
  themeMode: 'light' | 'dark' | 'system';
  onToggleTheme: (mode: 'light' | 'dark' | 'system') => void;
}

export const QlikHeader: React.FC<QlikHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onSelectAppById,
  activeStreamName,
  themeMode,
  onToggleTheme,
}) => {
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const waffleRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (waffleRef.current && !waffleRef.current.contains(target)) setIsWaffleOpen(false);
      if (createRef.current && !createRef.current.contains(target)) setIsCreateOpen(false);
      if (bellRef.current && !bellRef.current.contains(target)) setIsBellOpen(false);
      if (helpRef.current && !helpRef.current.contains(target)) setIsHelpOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
      if (themeRef.current && !themeRef.current.contains(target)) setIsThemeOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-between px-4 select-none shadow-xs transition-colors duration-150">
      {/* LEFT: Waffle Launcher & Qlik Hub Brand */}
      <div className="flex items-center gap-3">
        {/* Waffle 9-Dots Launcher */}
        <div className="relative" ref={waffleRef}>
          <button
            type="button"
            onClick={() => setIsWaffleOpen(!isWaffleOpen)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              isWaffleOpen
                ? 'bg-[#EBF5F0] dark:bg-slate-800 text-[#009845]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
            title="Qlik App Launcher & Modul Menu"
            aria-label="App Launcher"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Waffle Menu Dropdown */}
          {isWaffleOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-3 space-y-3 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-2 pt-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-[#009845]" />
                  Qlik Cloud & RME Modules
                </div>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-[#009845] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded font-mono">
                  v14.150 Enterprise
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectAppById('app-rme-dokter');
                    setIsWaffleOpen(false);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300">Ruang Periksa DPJP</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Rekam Medis SOAP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectAppById('app-bpjs-antrol');
                    setIsWaffleOpen(false);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Antrol BPJS & MJKN</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Loket & Kiosk QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectAppById('app-farmasi-kfa');
                    setIsWaffleOpen(false);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Pill className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">Farmasi & E-Resep</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Formularium KFA</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectAppById('app-kemenkes-inm');
                    setIsWaffleOpen(false);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300">Qlik Analytics INM</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Indikator Mutu</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectAppById('app-satusehat-sync');
                    setIsWaffleOpen(false);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300">SATUSEHAT FHIR</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">HL7 R4 Sync Engine</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectAppById('app-rekam-medis-arsip');
                    setIsWaffleOpen(false);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-slate-600">Arsip CPPT</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Histori Berkas RM</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2">
                <span className="hover:text-[#009845] cursor-pointer flex items-center gap-1">
                  <Sliders className="w-3 h-3" /> QMC Console
                </span>
                <span className="hover:text-[#009845] cursor-pointer flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Data Integration
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Qlik Brand Logo & Text */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-[#009845] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            Q
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Qlik Sense</span>
            <span className="text-xs font-bold text-[#009845]">Hub</span>
            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-600 font-light text-xs">|</span>
            <span className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-300 font-medium">
              RME Faskes Pratama
            </span>
          </div>
        </div>

        {/* Active Stream / Space Breadcrumb Pill */}
        <div className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Space:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 max-w-[180px] truncate">
            {activeStreamName}
          </span>
        </div>
      </div>

      {/* CENTER: Omnibox Global Search */}
      <div className="flex-1 max-w-xl mx-4 relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari aplikasi, pasien, rekam medis, sheet, data... (⌘K)"
            className="w-full h-9 pl-9 pr-14 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#009845]/40 focus:border-[#009845] transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:flex absolute right-3 pointer-events-none items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* RIGHT: Action Buttons, Theme Toggle, Help, Notifications, User Profile */}
      <div className="flex items-center gap-2">
        {/* + Add New / Create Dropdown Button */}
        <div className="relative" ref={createRef}>
          <button
            type="button"
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="h-8 px-3 rounded-lg bg-[#009845] hover:bg-[#00823B] active:bg-[#007033] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add new</span>
            <ChevronDown className="w-3 h-3 text-emerald-100" />
          </button>

          {/* Create Dropdown */}
          {isCreateOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Aksi Tambah Cepat
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenCreateModal();
                  setIsCreateOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-[#009845]" />
                Registrasi Pasien / Sesi Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenCreateModal();
                  setIsCreateOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-500" />
                Ambil Antrean Pasien Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenCreateModal();
                  setIsCreateOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-amber-500" />
                Buat Lembar Analisis (Sheet)
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <button
                type="button"
                onClick={() => {
                  onOpenCreateModal();
                  setIsCreateOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-500" />
                Impor Data Rekam Medis
              </button>
            </div>
          )}
        </div>

        {/* THEME TOGGLE (LIGHT / DARK / SYSTEM) */}
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Mode Tema Saat Ini: ${themeMode}`}
            aria-label="Theme Mode"
          >
            {themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Laptop className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme Dropdown */}
          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Pilih Tampilan
              </div>
              <button
                type="button"
                onClick={() => {
                  onToggleTheme('light');
                  setIsThemeOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-[#EBF5F0] dark:bg-emerald-950/40 text-[#009845] font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Mode Terang (Light)
                </span>
                {themeMode === 'light' && <span className="w-1.5 h-1.5 rounded-full bg-[#009845]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleTheme('dark');
                  setIsThemeOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-[#EBF5F0] dark:bg-emerald-950/40 text-[#009845] font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Mode Gelap (Dark)
                </span>
                {themeMode === 'dark' && <span className="w-1.5 h-1.5 rounded-full bg-[#009845]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleTheme('system');
                  setIsThemeOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-[#EBF5F0] dark:bg-emerald-950/40 text-[#009845] font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5 text-slate-500" />
                  Sistem OS
                </span>
                {themeMode === 'system' && <span className="w-1.5 h-1.5 rounded-full bg-[#009845]" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center cursor-pointer"
            title="Notifikasi & Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#009845] ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {/* Bell Dropdown */}
          {isBellOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#009845]" />
                  Notifikasi Sistem
                </span>
                <span className="text-[10px] text-[#009845] font-medium">3 belum dibaca</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px]">Pasien A-08 Check-in via MJKN</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Poli Umum • NIK 327325... verified IHS</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">2 menit yang lalu</div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#009845] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px]">SATUSEHAT FHIR Bundle Sync OK</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">28 Resource Encounter terkirim tanpa error</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">15 menit yang lalu</div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2">
                  <Pill className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px]">Pemberitahuan Stok Obat KFA</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Amoxicillin 500mg mendekati batas minimum</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">1 jam yang lalu</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help & Support Button */}
        <div className="relative" ref={helpRef}>
          <button
            type="button"
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
            title="Bantuan & Dokumentasi"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Help Dropdown */}
          {isHelpOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Pusat Bantuan & Panduan
              </div>
              <a
                href="#docs"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#009845]" />
                Panduan RME & Standar STARKES
              </a>
              <a
                href="#api"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-sky-500" />
                Kontrak REST API & BPJS Antrol
              </a>
              <div className="px-2.5 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex justify-between py-0.5">
                  <span>Cari Global</span>
                  <kbd className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">⌘K</kbd>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Qlik Engine</span>
                  <span className="text-[#009845] font-semibold">v14.150 Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#009845] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              DS
            </div>
            <div className="hidden xl:flex flex-col items-start text-left leading-tight">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">dr. Sarah Sp.PD</span>
              <span className="text-[10px] text-[#009845] font-mono font-medium">DPJP Poli Umum</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl p-2.5 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-2">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <div className="font-semibold text-xs text-slate-900 dark:text-white">dr. Sarah Sp.PD</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">SIP: 503/441/SIPD/2022</div>
                <div className="text-[10px] text-[#009845] mt-1 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Faskes: Puskesmas Sehat Sejahtera
                </div>
              </div>

              <div className="space-y-0.5 text-xs">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-left transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Profil & Kredensial Dokter
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Pengaturan Hub & Preferensi
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-[#009845]" />
                  Status Bridging BPJS & SATUSEHAT
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-left text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar dari Sesi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
