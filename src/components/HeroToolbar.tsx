import React from 'react';
import { CurrencyCode, CURRENCIES } from '../types';
import { formatCurrency } from '../utils/formatters';
import { KeyRound, Sparkles, TrendingDown, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HeroToolbarProps {
  currentMode: 'preloaded' | 'ingest';
  setCurrentMode: (mode: 'preloaded' | 'ingest') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  potentialSavingsINR: number;
  realizedSavingsINR: number;
  totalTrackedSpendINR: number;
  protectedSubsCount: number;
  jwtStatus: 'valid' | 'authenticating' | 'offline';
}

export const HeroToolbar: React.FC<HeroToolbarProps> = ({
  currentMode,
  setCurrentMode,
  currency,
  setCurrency,
  potentialSavingsINR,
  realizedSavingsINR,
  totalTrackedSpendINR,
  protectedSubsCount,
  jwtStatus,
}) => {
  return (
    <div className="border-b border-slate-800/80 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & Top Control Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google PAIR-Compliant Financial Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Actionable Transaction Intelligence & Leak Prevention
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time bank statement parsing with Gemini 2.5 Flash, automated financial waste detection,
              and human-in-the-loop autonomous safeguards.
            </p>
          </div>

          {/* Sandbox & Currency Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Mode Toggle: Preloaded vs Ingest Box */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setCurrentMode('preloaded')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  currentMode === 'preloaded'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pre-Loaded Statement
              </button>
              <button
                onClick={() => setCurrentMode('ingest')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  currentMode === 'ingest'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom SMS Ingest
              </button>
            </div>

            {/* Currency Selector (INR, USD, EUR) */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-lg">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setCurrency(code)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                    currency === code
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={CURRENCIES[code].name}
                >
                  {CURRENCIES[code].symbol} {code}
                </button>
              ))}
            </div>

            {/* JWT Status Pill/Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>JWT:</span>
              <span className="text-emerald-400 font-medium">
                {jwtStatus === 'valid' ? 'Verified' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>

        {/* Executive KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Potential Monthly Leaks</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-amber-400">
              {formatCurrency(potentialSavingsINR, currency)}
              <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">3 critical anomalies detected</div>
          </div>

          <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Realized Savings</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-emerald-400">
              {formatCurrency(realizedSavingsINR, currency)}
              <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Safeguards executed via PAIR</div>
          </div>

          <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Tracked Monthly Spend</span>
              <TrendingDown className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-white">
              {formatCurrency(totalTrackedSpendINR, currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Across 8 active accounts & cards</div>
          </div>

          <div className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Protected Mandates</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-white">
              {protectedSubsCount} / 6
            </div>
            <div className="text-xs text-slate-400 mt-1">Virtual cards & autopays capped</div>
          </div>
        </div>
      </div>
    </div>
  );
};
