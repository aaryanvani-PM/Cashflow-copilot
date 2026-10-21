import React from 'react';
import { ShieldCheck, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'inbox' | 'feed' | 'ingest';
  setActiveTab: (tab: 'inbox' | 'feed' | 'ingest') => void;
  onExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onExportReport }) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Cashflow Copilot
          </span>
        </div>

        {/* Zone 2: 4 Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'inbox'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Leaks Inbox
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'feed'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transaction Feed
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'ingest'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ingest Sandbox
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportReport}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
