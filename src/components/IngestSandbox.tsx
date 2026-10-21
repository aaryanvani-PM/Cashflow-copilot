import React, { useState } from 'react';
import { CurrencyCode, ParsedTransactionResult, Transaction, FinancialLeak } from '../types';
import { INGEST_PRESETS } from '../data/mockData';
import { parseTransactionWithGemini } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Send,
  PlusCircle,
  FileText,
  CheckCircle,
  Info,
} from 'lucide-react';

interface IngestSandboxProps {
  currency: CurrencyCode;
  onAddTransaction: (tx: Transaction) => void;
  onAddLeak?: (leak: FinancialLeak) => void;
  onOpenPairDrawer?: (leak: FinancialLeak) => void;
}

export const IngestSandbox: React.FC<IngestSandboxProps> = ({
  currency,
  onAddTransaction,
  onOpenPairDrawer,
}) => {
  const [inputText, setInputText] = useState(INGEST_PRESETS[0].rawText);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParsedTransactionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const handleSelectPreset = (raw: string) => {
    setInputText(raw);
    setResult(null);
    setErrorMsg(null);
    setIsAdded(false);
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setIsAdded(false);

    try {
      const response = await parseTransactionWithGemini(inputText, currency);
      setResult(response.data);
    } catch (err: any) {
      console.error('Ingest parse failed:', err);
      setErrorMsg(err.message || 'Failed to parse bank statement string');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToFeed = () => {
    if (!result) return;

    const confPct = Math.round((result.confidence || 0.95) * 100);
    const confLevel: 'High' | 'Med' | 'Low' = confPct >= 90 ? 'High' : confPct >= 75 ? 'Med' : 'Low';

    const newTx: Transaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      rawString: inputText,
      merchantName: result.merchantName,
      category: result.category,
      amountINR: result.amount,
      date: result.date || '21 Oct 2026',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: {
        name: 'Auto-Parsed Card',
        last4: result.cardLast4 || '8821',
        type: 'Credit Card',
      },
      recurrence: result.recurrence,
      anomalyTag: result.anomalyType !== 'none' ? (result.anomalyType as any) : null,
      status: result.anomalyType !== 'none' ? 'flagged' : 'cleared',
      confidenceLevel: confLevel,
      confidencePercentage: confPct,
      notes: result.explanation,
    };

    onAddTransaction(newTx);
    setIsAdded(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Raw SMS & Bank Statement Ingest Box
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Gemini 2.5 Flash Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Paste unstructured banking alerts, card terminal strings, or POS logs to extract structured merchant data and flag hidden waste.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Quick-Fill Sample Bank Alerts:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {INGEST_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.rawText)}
              className={`p-3 rounded-lg text-left text-xs transition-colors cursor-pointer border ${
                inputText === preset.rawText
                  ? 'bg-slate-800/90 border-emerald-500/50 text-white shadow-sm'
                  : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200 mb-1 flex items-center justify-between">
                <span>{preset.name}</span>
                <FileText className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Expected: {preset.expectedMerchant}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Raw Bank SMS / Statement String:
        </label>
        <div className="relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw bank alert SMS, POS terminal string, or statement row here..."
            className="w-full bg-[#111827] border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-500">
            Protected endpoint with server-side JWT authentication & `@google/genai` JSON schema enforcement.
          </div>
          <button
            onClick={handleParse}
            disabled={isLoading || !inputText.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Parsing via Gemini 2.5 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Live with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Parsed Result Card */}
      {result && (
        <div className="p-5 rounded-xl bg-[#0E1522] border border-slate-800 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Gemini Extraction Verified
              </span>
              <span className="text-xs text-slate-400 font-mono-numbers">
                (Confidence: {Math.round(result.confidence * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {result.anomalyType !== 'none' ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Anomaly Flagged: {result.anomalyType.replace('_', ' ').toUpperCase()}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Normal Clean Spend
                </span>
              )}
            </div>
          </div>

          {/* Grid of Extracted Attributes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">Normalized Merchant</div>
              <div className="text-sm font-bold text-white tracking-tight">{result.merchantName}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">Standardized Category</div>
              <div className="text-sm font-bold text-white tracking-tight">{result.category}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">Amount Invoiced</div>
              <div className="text-sm font-bold font-mono-numbers text-white">
                {formatCurrency(result.amount, currency)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">Cadence / Last 4</div>
              <div className="text-sm font-medium text-slate-200">
                {result.recurrence} · ••{result.cardLast4}
              </div>
            </div>
          </div>

          {/* AI Explanation & Suggested Action */}
          <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copilot Financial Rationale</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{result.explanation}</p>
            {result.leakEstimatedSavingsINR > 0 && (
              <div className="text-emerald-400 font-mono-numbers font-semibold mt-1">
                Estimated Monthly Savings: {formatCurrency(result.leakEstimatedSavingsINR, currency)}/mo
              </div>
            )}
          </div>

          {/* Add to Feed CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400">
              Commit this enriched record to your local session ledger.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isAdded ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium py-2 px-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                  <CheckCircle className="w-4 h-4" />
                  <span>Added to Transaction Feed</span>
                </div>
              ) : (
                <button
                  onClick={handleAddToFeed}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add to Active Feed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
