'use client';

import React from 'react';
import {
  Star,
  Clock,
  User,
  ArrowRight,
  MoreVertical,
  Stethoscope,
  Smartphone,
  Pill,
  Share2,
  BarChart3,
  FileText,
  FlaskConical,
  CreditCard,
  Layers,
} from 'lucide-react';
import { QlikApp } from '@/types/qlik';

interface QlikListViewProps {
  apps: QlikApp[];
  onOpenApp: (app: QlikApp) => void;
  onToggleFavorite: (appId: string) => void;
}

export const QlikListView: React.FC<QlikListViewProps> = ({
  apps,
  onOpenApp,
  onToggleFavorite,
}) => {
  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Pill':
        return <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'Share2':
        return <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'BarChart3':
        return <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-150">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="w-10 px-4 py-3 text-center">
                ★
              </th>
              <th scope="col" className="px-4 py-3">
                Nama Aplikasi / Ruang Kerja
              </th>
              <th scope="col" className="px-4 py-3">
                Stream / Space
              </th>
              <th scope="col" className="px-4 py-3">
                Status Operasional
              </th>
              <th scope="col" className="px-4 py-3">
                Terakhir Reload
              </th>
              <th scope="col" className="px-4 py-3">
                PJ / Author
              </th>
              <th scope="col" className="w-24 px-4 py-3 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {apps.map((app) => (
              <tr
                key={app.id}
                onClick={() => onOpenApp(app)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                {/* Favorite Toggle */}
                <td
                  className="px-4 py-3.5 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(app.id);
                  }}
                >
                  <button
                    type="button"
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      app.isFavorite
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${app.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </td>

                {/* App Name & Details */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {getAppIcon(app.iconName)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#009845] dark:group-hover:text-emerald-400 transition-colors">
                        {app.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                        {app.description}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Stream / Space */}
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                    <Layers className="w-3 h-3 text-slate-400" />
                    {app.streamName}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5">
                  {app.activeBadge ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-[#009845] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#009845]" />
                      {app.activeBadge.text}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>

                {/* Last Reload */}
                <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {app.lastReloadTime}
                </td>

                {/* Owner */}
                <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                  {app.owner}
                </td>

                {/* Action */}
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenApp(app);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#009845] dark:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Buka
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
