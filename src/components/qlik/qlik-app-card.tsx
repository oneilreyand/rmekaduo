'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Star,
  Clock,
  User,
  Layers,
  ArrowRight,
  ExternalLink,
  Copy,
  Info,
  CheckCircle2,
  Stethoscope,
  Smartphone,
  Pill,
  Share2,
  BarChart3,
  FileText,
  FlaskConical,
  CreditCard,
} from 'lucide-react';
import { QlikApp } from '@/types/qlik';

interface QlikAppCardProps {
  app: QlikApp;
  onOpenApp: (app: QlikApp) => void;
  onToggleFavorite: (appId: string) => void;
}

export const QlikAppCard: React.FC<QlikAppCardProps> = ({
  app,
  onOpenApp,
  onToggleFavorite,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 text-white" />;
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-white" />;
      case 'Pill':
        return <Pill className="w-6 h-6 text-white" />;
      case 'Share2':
        return <Share2 className="w-6 h-6 text-white" />;
      case 'BarChart3':
        return <BarChart3 className="w-6 h-6 text-white" />;
      case 'FlaskConical':
        return <FlaskConical className="w-6 h-6 text-white" />;
      case 'CreditCard':
        return <CreditCard className="w-6 h-6 text-white" />;
      default:
        return <FileText className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div
      onClick={() => onOpenApp(app)}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#009845] dark:hover:border-[#009845] shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* THUMBNAIL BANNER */}
      <div className={`relative h-32 bg-gradient-to-br ${app.thumbnailGradient} p-4 flex flex-col justify-between overflow-hidden`}>
        {/* Soft geometric background accents */}
        <div className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute left-1/3 -top-6 w-20 h-20 rounded-full bg-white/5 blur-lg pointer-events-none" />

        {/* Top bar on banner */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Active Status Badge */}
          {app.activeBadge ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {app.activeBadge.text}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/30 backdrop-blur-md text-white/80">
              Qlik App
            </span>
          )}

          {/* Favorite Star Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(app.id);
            }}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
              app.isFavorite
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'bg-black/30 text-white/70 hover:text-white hover:bg-black/50'
            }`}
            title={app.isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            <Star className={`w-3.5 h-3.5 ${app.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center / Bottom Icon & Sheet count */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
            {getAppIcon(app.iconName)}
          </div>
          <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            {app.sheets.length} Sheets
          </span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#009845] dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
            {app.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {app.description}
          </p>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {app.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60"
            >
              {tag}
            </span>
          ))}
          {app.tags.length > 3 && (
            <span className="text-[10px] font-medium text-slate-400 self-center">
              +{app.tags.length - 3}
            </span>
          )}
        </div>

        {/* CARD FOOTER */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate mr-2">
            <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{app.streamName}</span>
            <span>•</span>
            <span className="font-mono text-slate-400 dark:text-slate-500 text-[10px] whitespace-nowrap">{app.lastReloadTime}</span>
          </div>

          {/* Kebab Action Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Opsi Aplikasi"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 bottom-7 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-30 text-slate-700 dark:text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onOpenApp(app);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors font-semibold text-[#009845] cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Buka Aplikasi
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  Buka di Tab Baru
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onToggleFavorite(app.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  {app.isFavorite ? 'Hapus Favorit' : 'Tandai Favorit'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Duplikat Ruang Kerja
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
