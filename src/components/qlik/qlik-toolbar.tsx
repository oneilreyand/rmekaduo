'use client';

import React from 'react';
import {
  LayoutGrid,
  List,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';

interface QlikToolbarProps {
  streamTitle: string;
  totalApps: number;
  activeTag: string;
  onSelectTag: (tag: string) => void;
  availableTags: string[];
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  sortBy: 'reload' | 'name' | 'favorite';
  onChangeSortBy: (sort: 'reload' | 'name' | 'favorite') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const QlikToolbar: React.FC<QlikToolbarProps> = ({
  streamTitle,
  totalApps,
  activeTag,
  onSelectTag,
  availableTags,
  viewMode,
  onToggleViewMode,
  sortBy,
  onChangeSortBy,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs transition-colors duration-150">
      {/* LEFT: Stream Title & Category Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{streamTitle}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-slate-700 font-mono">
              {totalApps}
            </span>
          </h2>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectTag('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTag === 'all'
                ? 'bg-slate-900 dark:bg-[#009845] text-white shadow-xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            Semua Kategori
          </button>

          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTag === tag
                  ? 'bg-[#009845] text-white shadow-xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Sort, View Mode Toggle, Refresh Button */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as any)}
            className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="reload" className="dark:bg-slate-900">Terakhir Reload</option>
            <option value="name" className="dark:bg-slate-900">Nama (A-Z)</option>
            <option value="favorite" className="dark:bg-slate-900">Prioritas Favorit</option>
          </select>
        </div>

        {/* View Mode Grid/List Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onToggleViewMode('grid')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Grid View (App Cards)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('list')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="List View (Table)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
            isRefreshing ? 'animate-spin text-[#009845]' : ''
          }`}
          title="Segarkan Hub & Reload Engine"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
