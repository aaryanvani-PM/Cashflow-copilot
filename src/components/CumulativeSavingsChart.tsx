import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CurrencyCode } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { TrendingUp, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

interface CumulativeSavingsChartProps {
  currency: CurrencyCode;
  realizedSavingsINR: number;
  potentialSavingsINR: number;
}

export const CumulativeSavingsChart: React.FC<CumulativeSavingsChartProps> = ({
  currency,
  realizedSavingsINR,
  potentialSavingsINR,
}) => {
  const [timeRange, setTimeRange] = useState<'6m' | 'ytd' | '1y'>('6m');

  // Base cumulative timeline leading up to current month (Oct 2026)
  const baseMonthlyIncrements = [
    { month: 'May 26', addedINR: 2400, baselineCumulative: 2400 },
    { month: 'Jun 26', addedINR: 3200, baselineCumulative: 5600 },
    { month: 'Jul 26', addedINR: 2850, baselineCumulative: 8450 },
    { month: 'Aug 26', addedINR: 3500, baselineCumulative: 11950 },
    { month: 'Sep 26', addedINR: 3450, baselineCumulative: 15400 },
  ];

  // Current month includes previously secured base + newly executed safeguards from this session
  const currentMonthAdded = 3450 + realizedSavingsINR;
  const currentCumulative = 15400 + currentMonthAdded;

  // Projected next month if all active leaks are mitigated
  const projectedCumulative = currentCumulative + currentMonthAdded + potentialSavingsINR;

  const chartData = [
    ...baseMonthlyIncrements.map((d) => ({
      month: d.month,
      cumulativeINR: d.baselineCumulative,
      monthlyAddedINR: d.addedINR,
      projected: false,
    })),
    {
      month: 'Oct 26 (Current)',
      cumulativeINR: currentCumulative,
      monthlyAddedINR: currentMonthAdded,
      projected: false,
    },
    {
      month: 'Nov 26 (Projected)',
      cumulativeINR: projectedCumulative,
      monthlyAddedINR: currentMonthAdded + potentialSavingsINR,
      projected: true,
    },
  ];

  // Filter based on range if needed
  const displayData =
    timeRange === 'ytd'
      ? chartData
      : timeRange === '1y'
        ? chartData
        : chartData.slice(-6);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0E1522] p-5 space-y-4">
      {/* Chart Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              Realized Waste Mitigation
            </span>
            <span className="text-xs text-slate-400">PAIR Remediation Velocity</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Cumulative Monthly Savings Over Time
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified financial recovery from intercepted subscription creep, cancelled zombie trials, and card reward optimizations
          </p>
        </div>

        {/* Executive Metrics & Time Range Switcher */}
        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
          <div className="text-left sm:text-right">
            <div className="text-[11px] text-slate-400">Total Saved to Date</div>
            <div className="text-xl font-extrabold font-mono-numbers text-emerald-400">
              {formatCurrency(currentCumulative, currency)}
            </div>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
            {(['6m', 'ytd', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  timeRange === range
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === '6m' ? '6 Months' : range === 'ytd' ? 'YTD' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Area / Line Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCompactCurrency(val, currency)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs space-y-1 font-sans">
                      <div className="font-semibold text-slate-200">{data.month}</div>
                      <div className="flex items-center justify-between gap-4 font-mono-numbers">
                        <span className="text-slate-400">Cumulative Savings:</span>
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(data.cumulativeINR, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 font-mono-numbers text-[11px]">
                        <span className="text-slate-500">Monthly Added:</span>
                        <span className="text-cyan-300">
                          +{formatCurrency(data.monthlyAddedINR, currency)}
                        </span>
                      </div>
                      {data.projected && (
                        <div className="text-[10px] text-amber-400 pt-1 border-t border-slate-800">
                          Projected based on active leak remediation
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulativeINR"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#savingsAreaGradient)"
              activeDot={{ r: 6, fill: '#10B981', stroke: '#0B0F17', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Avg Monthly Run-Rate</span>
          <span className="font-bold font-mono-numbers text-white">
            {formatCurrency(Math.round(currentCumulative / 6), currency)}/mo
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Active Leak Remediation</span>
          <span className="font-bold font-mono-numbers text-emerald-400">
            {realizedSavingsINR > 0 ? `+${formatCurrency(realizedSavingsINR, currency)}/mo` : 'Awaiting Review'}
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400">Interception Success Rate</span>
          <span className="font-bold font-mono-numbers text-cyan-400">94.8%</span>
        </div>
      </div>
    </div>
  );
};
