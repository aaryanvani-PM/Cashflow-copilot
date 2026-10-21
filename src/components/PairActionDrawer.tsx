import React, { useState, useEffect } from 'react';
import { FinancialLeak, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Lock,
  CheckCircle,
  Copy,
  Check,
  Download,
  Sliders,
  RefreshCw,
} from 'lucide-react';

interface PairActionDrawerProps {
  leak: FinancialLeak | null;
  currency: CurrencyCode;
  onClose: () => void;
  onExecute: (leakId: string, updatedDraft: { emailBody: string; spendCap?: number }) => void;
}

export const PairActionDrawer: React.FC<PairActionDrawerProps> = ({
  leak,
  currency,
  onClose,
  onExecute,
}) => {
  if (!leak) return null;

  const isExecuted = leak.status === 'executed';

  // Local state for staged draft
  const [emailSubject, setEmailSubject] = useState(leak.stagedRemediation.emailSubject);
  const [emailBody, setEmailBody] = useState(leak.stagedRemediation.emailBody);
  const [recipient, setRecipient] = useState(leak.stagedRemediation.merchantEmail);
  const [spendCap, setSpendCap] = useState(leak.stagedRemediation.cardSpendCeiling || 499);
  const [isVirtualCardFrozen, setIsVirtualCardFrozen] = useState(true);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Sync when leak prop changes
  useEffect(() => {
    setEmailSubject(leak.stagedRemediation.emailSubject);
    setEmailBody(leak.stagedRemediation.emailBody);
    setRecipient(leak.stagedRemediation.merchantEmail);
    setSpendCap(leak.stagedRemediation.cardSpendCeiling || 499);
    setUserConfirmed(false);
  }, [leak]);

  const handleCopyDraft = () => {
    const text = `To: ${recipient}\nSubject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleResetDraft = () => {
    setEmailSubject(leak.stagedRemediation.emailSubject);
    setEmailBody(leak.stagedRemediation.emailBody);
    setRecipient(leak.stagedRemediation.merchantEmail);
  };

  const handleExecute = () => {
    if (!userConfirmed && !isExecuted) return;
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      onExecute(leak.id, {
        emailBody,
        spendCap: leak.category === 'price_creep' ? spendCap : undefined,
      });
    }, 700);
  };

  const downloadReceipt = () => {
    const content = `CASHFLOW COPILOT — REMEDIATION AUDIT RECEIPT
Reference: ${leak.receiptId || 'COPILOT-REM-' + leak.id.toUpperCase()}
Date: ${leak.executedAt || new Date().toISOString()}
Merchant: ${leak.merchantName}
Leak Type: ${leak.category.toUpperCase()}
Monthly Savings Secured: ₹${leak.monthlyImpactINR}/mo (Annual: ₹${leak.annualSavingsINR})
Human Authorization: VERIFIED (PAIR Principle Satisfied)

Remediation Actions Executed:
1. Merchant formal dispute/cancellation draft prepared and queued.
2. Payment network rule staged: ${
      leak.category === 'price_creep'
        ? `Virtual Card Spend Ceiling locked at ₹${spendCap}`
        : leak.category === 'zombie_trial'
          ? 'Recurring Card Token Frozen'
          : 'Payment routing re-assigned to 4x Travel Card'
    }

Cashflow Copilot Autonomous Financial Safeguards`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${leak.merchantName.replace(/\s+/g, '_')}_Safeguard.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0F141F] border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0B0F17]/80 sticky top-0 z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Google PAIR Staged Remediation
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {leak.confidenceScore}% Confidence
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isExecuted ? 'Remediation Safeguard Executed' : `Remediation Plan: ${leak.merchantName}`}
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Secures <span className="text-emerald-400 font-mono-numbers font-semibold">{formatCurrency(leak.monthlyImpactINR, currency)}/mo</span> ({formatCurrency(leak.annualSavingsINR, currency)} annualized savings)
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* PAIR Core Principle Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center shrink-0 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">Google PAIR Human-in-the-Loop Principle</div>
              <p className="text-slate-400 leading-relaxed">
                Autonomous AI agents must never move funds, alter contracts, or revoke subscriptions
                without human review. Below, Copilot has pre-staged the exact remedy; verify the draft and payment rule before authorizing.
              </p>
            </div>
          </div>

          {/* AI Detection Rationale */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>01. Transparent AI Detection Rationale</span>
            </div>
            <div className="p-4 rounded-xl bg-[#131A29] border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {leak.pairExplanation}
            </div>
          </div>

          {/* Staged Action 1: Merchant Communication Draft (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>02. Staged Merchant Notice (Editable Draft)</span>
              </div>
              {!isExecuted && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetDraft}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </button>
                  <button
                    onClick={handleCopyDraft}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {copiedDraft ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedDraft ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#131A29] border border-slate-800 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Recipient Support Desk
                </label>
                <input
                  type="email"
                  value={recipient}
                  disabled={isExecuted}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  disabled={isExecuted}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Message Body (Pre-drafted by Copilot)
                </label>
                <textarea
                  rows={5}
                  value={emailBody}
                  disabled={isExecuted}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Staged Action 2: Payment Network Safeguard */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>03. Staged Card & Mandate Protection</span>
            </div>

            <div className="p-4 rounded-xl bg-[#131A29] border border-slate-800 space-y-4">
              {leak.category === 'price_creep' && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-300 font-medium">Virtual Card Recurring Spend Ceiling</span>
                    <span className="font-mono-numbers text-emerald-400 font-bold">
                      {formatCurrency(spendCap, currency)} / month
                    </span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={700}
                    step={10}
                    value={spendCap}
                    disabled={isExecuted}
                    onChange={(e) => setSpendCap(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer disabled:opacity-60"
                  />
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Floor: ₹400</span>
                    <span>Any billing &gt; {formatCurrency(spendCap, currency)} will auto-reject</span>
                    <span>Ceiling: ₹700</span>
                  </div>
                </div>
              )}

              {leak.category === 'reward_optimizer' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-300">
                    Switch Default Mandate for Merchant:
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">HDFC Infinia Travel Platinum (••4410)</div>
                      <div className="text-[11px] text-emerald-400">Earns 16.5% effective reward rate on flights</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                      Recommended
                    </span>
                  </div>
                </div>
              )}

              {leak.category === 'zombie_trial' && (
                <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div>
                    <div className="text-xs font-bold text-white">Freeze Recurring Virtual Token</div>
                    <div className="text-[11px] text-slate-400">
                      Instantly blocks ICICI Virtual Card (••7712) for Midjourney Inc.
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVirtualCardFrozen(!isVirtualCardFrozen)}
                    disabled={isExecuted}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      isVirtualCardFrozen
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isVirtualCardFrozen ? 'Token Frozen' : 'Token Active'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Audit Receipt View if already executed */}
          {isExecuted && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>Safeguard Receipt: {leak.receiptId || 'COPILOT-REM-' + leak.id.slice(0, 8)}</span>
                </div>
                <button
                  onClick={downloadReceipt}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-900/50 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
              <div className="text-xs text-slate-300 font-mono-numbers">
                Executed at: {leak.executedAt || new Date().toLocaleTimeString()} · Status: Active Issuer Lock
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer & Human Confirmation Gate */}
        <div className="p-6 border-t border-slate-800 bg-[#0B0F17] sticky bottom-0 z-10 space-y-3">
          {!isExecuted ? (
            <>
              {/* Mandatory Human Review Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={userConfirmed}
                  onChange={(e) => setUserConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300">
                  I have verified the staged email draft and card safeguard. I authorize Cashflow Copilot to execute this protection.
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-4 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={!userConfirmed || isExecuting}
                  className="w-2/3 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Enforcing Network Safeguard...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Execute Safeguard</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Remediation verified. Recurring leak prevented.
              </span>
              <button
                onClick={onClose}
                className="py-2 px-5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
