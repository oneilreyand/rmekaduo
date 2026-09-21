'use client';

import React from 'react';
import {
  Home,
  Layers,
  Star,
  Folder,
  FolderOpen,
  Briefcase,
  Users,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Server,
  Smartphone,
  Share2,
  FileText,
  Sliders,
  Database,
  Pill,
  BarChart3,
  Stethoscope,
} from 'lucide-react';
import { QlikStream } from '@/types/qlik';

interface QlikSidebarProps {
  streams: QlikStream[];
  activeStreamId: string;
  onSelectStream: (streamId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  favoriteCount: number;
}

export const QlikSidebar: React.FC<QlikSidebarProps> = ({
  streams,
  activeStreamId,
  onSelectStream,
  isOpen,
  onToggle,
  favoriteCount,
}) => {
  const getStreamIcon = (iconName: string, isActive: boolean) => {
    const iconClass = `w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#009845]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`;
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className={iconClass} />;
      case 'Smartphone':
        return <Smartphone className={iconClass} />;
      case 'Pill':
        return <Pill className={iconClass} />;
      case 'Share2':
        return <Share2 className={iconClass} />;
      case 'BarChart3':
        return <BarChart3 className={iconClass} />;
      default:
        return isActive ? <FolderOpen className={iconClass} /> : <Folder className={iconClass} />;
    }
  };

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 z-30 bg-[#F8F9FA] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 select-none shadow-xs ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* 1. TOP TOGGLE / TITLE */}
      <div className="h-11 px-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/90 transition-colors duration-150">
        {isOpen ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Qlik Sense Navigation
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 mx-auto">HUB</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            !isOpen ? 'mx-auto' : ''
          }`}
          title={isOpen ? 'Ciutkan Sidebar' : 'Bentangkan Sidebar'}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. MAIN NAVIGATION LIST (1:1 QLIK SENSE ENTERPRISE & CLOUD HIERARCHY) */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {/* A. ACTIVITY CENTERS / SHORTCUTS */}
        <div className="space-y-0.5">
          {isOpen && (
            <div className="px-4 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Activity
            </div>
          )}

          {/* Home / Catalog (All) */}
          <button
            type="button"
            onClick={() => onSelectStream('everyone')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs transition-all group cursor-pointer border-l-[3.5px] ${
              activeStreamId === 'everyone'
                ? 'border-[#009845] bg-[#EBF5F0] dark:bg-[#009845]/15 text-[#009845] font-semibold'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
            title="Catalog (Semua Aplikasi & Ruang Kerja)"
          >
            <Home
              className={`w-4 h-4 flex-shrink-0 ${
                activeStreamId === 'everyone' ? 'text-[#009845]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              }`}
            />
            {isOpen && (
              <div className="flex-1 flex items-center justify-between text-left min-w-0">
                <span className="truncate">Home / Catalog</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  8
                </span>
              </div>
            )}
          </button>

          {/* Favorites */}
          <button
            type="button"
            onClick={() => onSelectStream('favorites')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs transition-all group cursor-pointer border-l-[3.5px] ${
              activeStreamId === 'favorites'
                ? 'border-[#009845] bg-[#EBF5F0] dark:bg-[#009845]/15 text-[#009845] font-semibold'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
            title="Aplikasi Favorit Saya"
          >
            <Star
              className={`w-4 h-4 flex-shrink-0 ${
                activeStreamId === 'favorites'
                  ? 'fill-[#009845] text-[#009845]'
                  : 'text-amber-500 fill-amber-500/30 group-hover:text-amber-600'
              }`}
            />
            {isOpen && (
              <div className="flex-1 flex items-center justify-between text-left min-w-0">
                <span className="truncate">Favorites</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {favoriteCount}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* B. PERSONAL / WORK SECTION (Qlik Sense Work Section) */}
        <div className="space-y-0.5">
          {isOpen && (
            <div className="px-4 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Personal</span>
              <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 py-0.2 rounded font-mono">WORK</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onSelectStream('rawat-jalan')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs transition-all group cursor-pointer border-l-[3.5px] ${
              activeStreamId === 'rawat-jalan'
                ? 'border-[#009845] bg-[#EBF5F0] dark:bg-[#009845]/15 text-[#009845] font-semibold'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium'
            }`}
            title="Work: Ruang Kerja Dokter & Rawat Jalan"
          >
            <Briefcase
              className={`w-4 h-4 flex-shrink-0 ${
                activeStreamId === 'rawat-jalan' ? 'text-[#009845]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              }`}
            />
            {isOpen && (
              <div className="flex-1 flex items-center justify-between text-left min-w-0">
                <span className="truncate">Work (My Clinical Space)</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  2
                </span>
              </div>
            )}
          </button>
        </div>

        {/* C. PUBLISHED STREAMS (Qlik Sense Streams Section) */}
        <div className="space-y-0.5">
          {isOpen && (
            <div className="px-4 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Published Streams</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">FASKES</span>
            </div>
          )}

          {streams
            .filter((s) => s.id !== 'everyone')
            .map((stream) => {
              const isActive = activeStreamId === stream.id;
              return (
                <button
                  key={stream.id}
                  type="button"
                  onClick={() => onSelectStream(stream.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs transition-all group cursor-pointer border-l-[3.5px] ${
                    isActive
                      ? 'border-[#009845] bg-[#EBF5F0] dark:bg-[#009845]/15 text-[#009845] font-semibold'
                      : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title={stream.name}
                >
                  {getStreamIcon(stream.icon, isActive)}

                  {isOpen && (
                    <div className="flex-1 flex items-center justify-between text-left min-w-0">
                      <span className="truncate">{stream.name}</span>
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ml-2 ${
                          isActive
                            ? 'bg-[#009845]/15 text-[#009845] font-bold'
                            : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        }`}
                      >
                        {stream.count}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* 3. BOTTOM FOOTER: Qlik Engine v14 & Tenant Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 transition-colors duration-150">
        {isOpen ? (
          <div className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Server className="w-3.5 h-3.5 text-[#009845]" />
                Qlik Engine
              </span>
              <span className="text-[10px] text-[#009845] font-mono bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded font-bold">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">Tenant:</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">
                Puskesmas Sehat
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400" title="Qlik Engine Online">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009845] ring-2 ring-emerald-100 dark:ring-emerald-950" />
          </div>
        )}
      </div>
    </aside>
  );
};
