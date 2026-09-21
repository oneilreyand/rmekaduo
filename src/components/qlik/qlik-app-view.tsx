'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Filter,
  X,
  RotateCcw,
  Bookmark,
  Share2,
  Layers,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Table as TableIcon,
  LineChart,
  CheckCircle2,
  Stethoscope,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { QlikApp, QlikSheet, QlikFilterSelection } from '@/types/qlik';

interface QlikAppViewProps {
  app: QlikApp;
  onBackToHub: () => void;
  filterSelections: QlikFilterSelection[];
  onRemoveFilter: (field: string) => void;
  onClearAllFilters: () => void;
}

export const QlikAppView: React.FC<QlikAppViewProps> = ({
  app,
  onBackToHub,
  filterSelections,
  onRemoveFilter,
  onClearAllFilters,
}) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  const activeSheet: QlikSheet = app.sheets[activeSheetIndex] || app.sheets[0];

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 800);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-150">
      {/* 1. APP TOP BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-slate-800 dark:text-white shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Hub</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">{app.title}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-[#009845] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                Live App
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{app.streamName}</span>
              <span>•</span>
              <span>PJ: {app.owner}</span>
              <span>•</span>
              <span>Reload: {app.lastReloadTime}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReload}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${
              isReloading ? 'text-[#009845]' : ''
            }`}
            title="Reload Data App"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reload Data</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#009845] hover:bg-[#00823B] text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simpan Bookmark</span>
          </button>
        </div>
      </div>

      {/* 2. QLIK ASSOCIATIVE SELECTION BAR (Green = Selected, White = Alternative, Gray = Excluded) */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-between gap-3 text-xs overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#009845]" />
            <span>Qlik Selections:</span>
          </div>

          {filterSelections.length > 0 && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-none py-0.5">
          {filterSelections.map((sel) => {
            let modeClass = 'bg-[#009845] text-white border-emerald-600'; // Green = Selected
            let modeBadge = 'SELECTED';

            if (sel.mode === 'alternative') {
              modeClass = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'; // White = Alternative
              modeBadge = 'POSSIBLE';
            } else if (sel.mode === 'excluded') {
              modeClass = 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'; // Gray = Excluded
              modeBadge = 'EXCLUDED';
            }

            return (
              <div
                key={sel.field}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border shadow-xs transition-all ${modeClass}`}
              >
                <span className="font-bold opacity-90">{sel.field}:</span>
                <span className="truncate max-w-[140px]">{sel.selectedValues.join(', ')}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 font-mono uppercase">
                  {modeBadge}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFilter(sel.field)}
                  className="p-0.5 rounded hover:bg-black/20 ml-1 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend Hint */}
        <div className="hidden xl:flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-[#009845]" /> Hijau (Terpilih)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-white border border-slate-300 dark:border-slate-600" /> Putih (Alternatif)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-slate-300 dark:bg-slate-600" /> Abu-abu (Tereksklusi)
          </span>
        </div>
      </div>

      {/* 3. SHEET TABS NAVIGATION */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 pt-2 flex items-center gap-2 overflow-x-auto shadow-2xs">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          Sheets:
        </span>
        {app.sheets.map((sheet, index) => {
          const isActive = index === activeSheetIndex;
          return (
            <button
              key={sheet.id}
              type="button"
              onClick={() => setActiveSheetIndex(index)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'border-[#009845] text-[#009845] bg-[#EBF5F0]/60 dark:bg-emerald-950/30 rounded-t-lg'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-t-lg'
              }`}
            >
              <span>{sheet.title}</span>
            </button>
          );
        })}
      </div>

      {/* 4. SHEET WORKSPACE CONTENT */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Sheet Overview Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{activeSheet.title}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                Sheet {activeSheetIndex + 1} of {app.sheets.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeSheet.description}</p>
          </div>

          {/* Special Action: Quick Jump to Clinical Workspace */}
          {app.id === 'app-rme-dokter' && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-[#009845] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-[#009845]" />
                Standar STARKES RME Aktif
              </span>
            </div>
          )}
        </div>

        {/* Sheet KPIs / Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeSheet.metricsSummary.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 hover:border-[#009845] dark:hover:border-[#009845] transition-colors"
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {metric.label}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {metric.value}
              </div>
              {metric.delta && (
                <div
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    metric.isPositive === true
                      ? 'text-[#009845] dark:text-emerald-400'
                      : metric.isPositive === false
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{metric.delta}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Visual Analytic Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-white">
              <BarChart2 className="w-4 h-4 text-[#009845]" />
              <span>Visualisasi Analitik Interaktif: {activeSheet.title}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Qlik Associative Hypercube Engine</span>
          </div>

          <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF5F0] dark:bg-[#009845]/20 text-[#009845] flex items-center justify-center shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Visualisasi Lembar Kerja Siap Dihubungkan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Data dimensi dan pengukuran pada sheet ini tersambung ke domain model rekam medis{' '}
                <code className="bg-slate-200/80 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800 dark:text-slate-200">src/types/rme.ts</code>{' '}
                dan kontrak integrasi BPJS/SATUSEHAT.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onBackToHub}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Eksplorasi Aplikasi Lain di Hub
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
