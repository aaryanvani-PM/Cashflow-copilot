import React, { useState } from 'react';
import { Transaction, CurrencyCode } from '../types';
import { formatCurrency, getMerchantInitials, getMerchantBgColor } from '../utils/formatters';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransactionFeedProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  onSelectAnomaly?: (anomalyTag: string) => void;
  searchQuery?: string;
  selectedCategory?: string;
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({
  transactions,
  currency,
  onSelectAnomaly,
  searchQuery = '',
  selectedCategory = 'all',
}) => {
  const [viewMode, setViewMode] = useState<'enriched' | 'raw'>('enriched');

  const filtered = transactions.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      t.merchantName.toLowerCase().includes(query) ||
      t.rawString.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="space-y-4">
      {/* Feed Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Transaction Intelligence Feed
            </h2>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {filtered.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare unparsed banking SMS/POS messages directly against Copilot's enriched ledger
          </p>
        </div>

        {/* View Mode Toggle: Raw SMS vs Copilot Enriched */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'raw'
                ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Bank SMS View
          </button>
          <button
            onClick={() => setViewMode('enriched')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'enriched'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copilot Enriched View</span>
          </button>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="rounded-xl border border-slate-800 bg-[#0E1420] overflow-hidden">
        {viewMode === 'raw' ? (
          /* Raw Cryptic SMS / Terminal View */
          <div className="divide-y divide-slate-800/80">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono"
              >
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-bold text-amber-300 tracking-wide break-all">
                    {tx.rawString}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>ID: {tx.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>LOG: {tx.date} {tx.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-300">RAW_PAYLOAD</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-200 font-mono-numbers">
                    {formatCurrency(tx.amountINR, currency)}
                  </div>
                  <div className="text-[10px] text-slate-400">UNENRICHED</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Copilot Enriched View */
          <div className="divide-y divide-slate-800/80">
            {filtered.map((tx) => {
              const isFlagged = tx.status === 'flagged';

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Brand Avatar & Enriched Details */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${getMerchantBgColor(
                        tx.merchantName
                      )}`}
                    >
                      {getMerchantInitials(tx.merchantName)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {tx.merchantName}
                        </span>

                        {/* Recurrence Cadence */}
                        <span className="text-[11px] text-slate-400">
                          ({tx.recurrence})
                        </span>

                        {/* FX Markup Tag */}
                        {tx.fxMarkupPercent && tx.fxMarkupPercent > 0 && (
                          <span className="text-[11px] text-amber-400 font-mono-numbers font-medium">
                            {tx.fxMarkupPercent}% FX markup
                          </span>
                        )}
                      </div>

                      {/* Clean Unboxed Metadata with Category & AI Confidence Badge */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-300">{tx.category}</span>
                          {/* Visual Confidence Score Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              tx.confidenceLevel === 'Low' || (tx.confidencePercentage && tx.confidencePercentage < 75)
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : tx.confidenceLevel === 'Med' || (tx.confidencePercentage && tx.confidencePercentage < 90)
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}
                            title={`AI Categorization Confidence: ${tx.confidencePercentage || 98}% (${tx.confidenceLevel || 'High'})`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                tx.confidenceLevel === 'Low' || (tx.confidencePercentage && tx.confidencePercentage < 75)
                                  ? 'bg-rose-400'
                                  : tx.confidenceLevel === 'Med' || (tx.confidencePercentage && tx.confidencePercentage < 90)
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-400'
                              }`}
                            />
                            <span>{tx.confidenceLevel || (tx.confidencePercentage && tx.confidencePercentage >= 90 ? 'High' : 'Med')}</span>
                            <span className="opacity-70 font-mono text-[9px]">{tx.confidencePercentage || 98}%</span>
                          </span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.paymentMethod.name} (••{tx.paymentMethod.last4})</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-numbers">{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status / Anomaly */}
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-bold font-mono-numbers text-white">
                      {formatCurrency(tx.amountINR, currency)}
                    </div>

                    <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                      {isFlagged ? (
                        <div
                          onClick={() => onSelectAnomaly && tx.anomalyTag && onSelectAnomaly(tx.anomalyTag)}
                          className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>
                            {tx.anomalyTag === 'price_creep' && 'Price Creep'}
                            {tx.anomalyTag === 'reward_optimizer' && 'Reward Loss'}
                            {tx.anomalyTag === 'zombie_trial' && 'Zombie Renewal'}
                            {tx.anomalyTag === 'fx_markup' && 'FX Spike'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Cleared</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No transactions match your search query "{searchQuery}" in category "{selectedCategory}". Try clearing filters.
          </div>
        )}
      </div>
    </section>
  );
};
