import React from 'react';
import { FinancialLeak, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, CreditCard, Clock, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface FinancialLeaksInboxProps {
  leaks: FinancialLeak[];
  currency: CurrencyCode;
  onReviewLeak: (leak: FinancialLeak) => void;
}

export const FinancialLeaksInbox: React.FC<FinancialLeaksInboxProps> = ({
  leaks,
  currency,
  onReviewLeak,
}) => {
  const activeLeaks = leaks.filter((l) => l.status !== 'executed');
  const activePotentialTotal = activeLeaks.reduce((sum, l) => sum + l.monthlyImpactINR, 0);

  return (
    <section className="space-y-4">
      {/* Header of Action Inbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Financial Leaks Action Inbox
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {activeLeaks.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Proactive waste detection engine auditing recurring billing anomalies and payment card routing
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-slate-400">Identified Monthly Leakage</div>
          <div className="text-lg font-extrabold font-mono-numbers text-amber-400">
            {formatCurrency(activePotentialTotal, currency)}
            <span className="text-xs text-slate-400 font-normal">/mo potential savings</span>
          </div>
        </div>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaks.map((leak) => {
          const isExecuted = leak.status === 'executed';

          return (
            <div
              key={leak.id}
              className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                isExecuted
                  ? 'bg-slate-900/40 border-emerald-900/40 opacity-80'
                  : leak.category === 'price_creep'
                    ? 'bg-[#121824] border-amber-500/30 hover:border-amber-500/50 shadow-sm'
                    : leak.category === 'reward_optimizer'
                      ? 'bg-[#121824] border-cyan-500/30 hover:border-cyan-500/50 shadow-sm'
                      : 'bg-[#121824] border-rose-500/30 hover:border-rose-500/50 shadow-sm'
              }`}
            >
              <div>
                {/* Top Row: Category Icon & Monthly Impact */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isExecuted
                          ? 'bg-emerald-950 text-emerald-400'
                          : leak.category === 'price_creep'
                            ? 'bg-amber-950/80 text-amber-400'
                            : leak.category === 'reward_optimizer'
                              ? 'bg-cyan-950/80 text-cyan-400'
                              : 'bg-rose-950/80 text-rose-400'
                      }`}
                    >
                      {leak.category === 'price_creep' && <TrendingUp className="w-4 h-4" />}
                      {leak.category === 'reward_optimizer' && <CreditCard className="w-4 h-4" />}
                      {leak.category === 'zombie_trial' && <Clock className="w-4 h-4" />}
                    </div>

                    <div className="text-xs font-medium text-slate-400">
                      {leak.category === 'price_creep' && 'Price Creep'}
                      {leak.category === 'reward_optimizer' && 'Reward Optimizer'}
                      {leak.category === 'zombie_trial' && 'Zombie Subscription'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono-numbers text-white">
                      +{formatCurrency(leak.monthlyImpactINR, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Monthly Waste
                    </div>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-base font-bold text-white tracking-tight leading-snug mb-1">
                  {leak.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {leak.subtitle}
                </p>

                {/* Specific Metric Breakdown without pills */}
                <div className="py-2.5 px-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-4 space-y-1">
                  {leak.category === 'price_creep' && (
                    <>
                      <div className="flex justify-between font-mono-numbers">
                        <span className="text-slate-400">Original Rate:</span>
                        <span>{formatCurrency(leak.details.previousAmountINR || 0, currency)}</span>
                      </div>
                      <div className="flex justify-between font-mono-numbers">
                        <span className="text-slate-400">Current Invoiced:</span>
                        <span className="text-amber-400 font-semibold">
                          {formatCurrency(leak.details.newAmountINR || 0, currency)} (+{leak.details.percentageIncrease}%)
                        </span>
                      </div>
                    </>
                  )}

                  {leak.category === 'reward_optimizer' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Card Billed:</span>
                        <span className="truncate max-w-[150px]">{leak.details.cardUsed}</span>
                      </div>
                      <div className="flex justify-between font-mono-numbers">
                        <span className="text-slate-400">Missed Reward Value:</span>
                        <span className="text-cyan-400 font-semibold">
                          {formatCurrency(leak.details.missedPointsValueINR || 0, currency)} (4x points)
                        </span>
                      </div>
                    </>
                  )}

                  {leak.category === 'zombie_trial' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Usage Audit:</span>
                        <span className="text-rose-400 font-semibold">
                          0 prompts in {leak.details.daysInactive} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Next Auto-Debit:</span>
                        <span className="font-mono-numbers text-slate-200">
                          {leak.details.renewalDate}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Action Area */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                  <span>Merchant: {leak.merchantName}</span>
                  <span aria-hidden="true">·</span>
                  <span>PAIR Confidence: {leak.confidenceScore}%</span>
                </div>

                {isExecuted ? (
                  <div className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Safeguard Executed
                    </span>
                    <button
                      onClick={() => onReviewLeak(leak)}
                      className="text-xs text-emerald-400 underline hover:text-emerald-200 cursor-pointer"
                    >
                      View Receipt
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onReviewLeak(leak)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer shadow-sm shadow-white/10"
                  >
                    <span>Fix This</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
