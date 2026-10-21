import React, { useState, useEffect } from 'react';
import { CurrencyCode, FinancialLeak, Transaction } from './types';
import { INITIAL_LEAKS, INITIAL_TRANSACTIONS } from './data/mockData';
import { getAuthToken, checkServerHealth } from './services/api';
import { Header } from './components/Header';
import { HeroToolbar } from './components/HeroToolbar';
import { CumulativeSavingsChart } from './components/CumulativeSavingsChart';
import { FinancialLeaksInbox } from './components/FinancialLeaksInbox';
import { TransactionSearchBar } from './components/TransactionSearchBar';
import { TransactionFeed } from './components/TransactionFeed';
import { IngestSandbox } from './components/IngestSandbox';
import { PairActionDrawer } from './components/PairActionDrawer';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'feed' | 'ingest'>('inbox');
  const [currentMode, setCurrentMode] = useState<'preloaded' | 'ingest'>('preloaded');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [leaks, setLeaks] = useState<FinancialLeak[]>(INITIAL_LEAKS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedLeak, setSelectedLeak] = useState<FinancialLeak | null>(null);
  const [jwtStatus, setJwtStatus] = useState<'valid' | 'authenticating' | 'offline'>('authenticating');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Category Filter State for Transaction Feed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    ...Array.from(new Set(transactions.map((t) => t.category))),
  ];

  const filteredTransactionsCount = transactions.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      t.merchantName.toLowerCase().includes(q) ||
      t.rawString.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).length;

  // Authenticate and obtain JWT token on mount
  useEffect(() => {
    async function initAuth() {
      try {
        await getAuthToken();
        const health = await checkServerHealth();
        setJwtStatus(health.status === 'healthy' ? 'valid' : 'valid');
      } catch (err) {
        console.warn('Backend connection warning:', err);
        setJwtStatus('offline');
      }
    }
    initAuth();
  }, []);

  // When sandbox mode toggle changes, sync view tab
  const handleModeChange = (mode: 'preloaded' | 'ingest') => {
    setCurrentMode(mode);
    if (mode === 'ingest') {
      setActiveTab('ingest');
    } else {
      setActiveTab('inbox');
    }
  };

  // Execute human-in-the-loop remediation
  const handleExecuteSafeguard = (
    leakId: string,
    updatedDraft: { emailBody: string; spendCap?: number }
  ) => {
    const receiptNum = `COPILOT-REM-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toLocaleString();

    setLeaks((prev) =>
      prev.map((leak) => {
        if (leak.id === leakId) {
          return {
            ...leak,
            status: 'executed',
            executedAt: nowStr,
            receiptId: receiptNum,
            stagedRemediation: {
              ...leak.stagedRemediation,
              emailBody: updatedDraft.emailBody,
              cardSpendCeiling: updatedDraft.spendCap || leak.stagedRemediation.cardSpendCeiling,
            },
          };
        }
        return leak;
      })
    );

    // Update matching transaction status to mitigated
    setTransactions((prev) =>
      prev.map((tx) => {
        const matchingLeak = leaks.find((l) => l.id === leakId);
        if (
          matchingLeak &&
          tx.merchantName.toLowerCase().includes(matchingLeak.merchantName.toLowerCase().split(' ')[0])
        ) {
          return { ...tx, status: 'mitigated' };
        }
        return tx;
      })
    );

    // Keep drawer open in executed state so user sees confirmation & receipt
    setSelectedLeak((prev) =>
      prev?.id === leakId
        ? {
            ...prev,
            status: 'executed',
            executedAt: nowStr,
            receiptId: receiptNum,
          }
        : prev
    );

    setToastMessage(`Safeguard executed successfully. Receipt #${receiptNum} generated.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add parsed transaction from Ingest Sandbox
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setToastMessage(`Enriched record for "${newTx.merchantName}" appended to transaction feed.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Select anomaly from feed to open in PAIR drawer
  const handleSelectAnomalyFromFeed = (anomalyTag: string) => {
    const leak = leaks.find((l) => l.category === anomalyTag);
    if (leak) {
      setSelectedLeak(leak);
    } else {
      setActiveTab('inbox');
    }
  };

  // Export full audit report
  const handleExportAuditReport = () => {
    const executedLeaks = leaks.filter((l) => l.status === 'executed');
    const activeLeaks = leaks.filter((l) => l.status !== 'executed');
    const potentialTotal = activeLeaks.reduce((s, l) => s + l.monthlyImpactINR, 0);
    const realizedTotal = executedLeaks.reduce((s, l) => s + l.monthlyImpactINR, 0);

    const report = `# CASHFLOW COPILOT — EXECUTIVE TRANSACTION AUDIT & LEAK REPORT
Generated: ${new Date().toUTCString()}
Security: Authenticated via JWT Session
PAIR Human-in-the-Loop Standard: ENFORCED

---
## Executive Summary
- Total Tracked Transactions: ${transactions.length}
- Potential Monthly Waste Identified: ₹${potentialTotal}/month (₹${potentialTotal * 12}/year)
- Realized Monthly Savings Secured: ₹${realizedTotal}/month (₹${realizedTotal * 12}/year)
- Protected Payment Mandates: ${executedLeaks.length} of ${leaks.length}

---
## Detailed Financial Leaks & Remediation Status
${leaks
  .map(
    (l, idx) => `
### ${idx + 1}. ${l.title}
- Merchant: ${l.merchantName}
- Category: ${l.category.toUpperCase()}
- Monthly Impact: ₹${l.monthlyImpactINR}
- PAIR Confidence: ${l.confidenceScore}%
- Status: ${l.status.toUpperCase()}${l.receiptId ? ` (Receipt #${l.receiptId})` : ''}
- Rationale: ${l.pairExplanation}
`
  )
  .join('')}

---
## Transaction Ledger (Summary)
${transactions
  .map(
    (t) =>
      `[${t.date}] ${t.merchantName.padEnd(26)} ₹${t.amountINR.toString().padStart(6)} (${t.category}) - ${t.status.toUpperCase()}`
  )
  .join('\n')}

Cashflow Copilot Financial Intelligence Engine
`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cashflow_Copilot_Audit_Report_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Savings calculations
  const activePotentialSavings = leaks
    .filter((l) => l.status !== 'executed')
    .reduce((sum, l) => sum + l.monthlyImpactINR, 0);

  const realizedSavings = leaks
    .filter((l) => l.status === 'executed')
    .reduce((sum, l) => sum + l.monthlyImpactINR, 0);

  const totalTrackedSpend = transactions.reduce((sum, t) => sum + t.amountINR, 0);
  const protectedSubsCount = leaks.filter((l) => l.status === 'executed').length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportReport={handleExportAuditReport}
      />

      {/* Hero Strip & Executive Toolbar */}
      <HeroToolbar
        currentMode={currentMode}
        setCurrentMode={handleModeChange}
        currency={currency}
        setCurrency={setCurrency}
        potentialSavingsINR={activePotentialSavings}
        realizedSavingsINR={realizedSavings}
        totalTrackedSpendINR={totalTrackedSpend}
        protectedSubsCount={protectedSubsCount}
        jwtStatus={jwtStatus}
      />

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-10">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-40 p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Router */}
        {activeTab === 'inbox' && (
          <div className="space-y-8">
            {/* 1. Cumulative Monthly Savings Over Time (Recharts line/area chart at the top of Inbox view) */}
            <CumulativeSavingsChart
              currency={currency}
              realizedSavingsINR={realizedSavings}
              potentialSavingsINR={activePotentialSavings}
            />

            {/* 2. The 3-Card Financial Leaks Inbox */}
            <FinancialLeaksInbox
              leaks={leaks}
              currency={currency}
              onReviewLeak={(leak) => setSelectedLeak(leak)}
            />

            {/* 3. Search Bar & Transaction Feed */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <TransactionSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                totalCount={transactions.length}
                filteredCount={filteredTransactionsCount}
              />
              <TransactionFeed
                transactions={transactions}
                currency={currency}
                onSelectAnomaly={handleSelectAnomalyFromFeed}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Search Input Bar above TransactionFeed */}
            <TransactionSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              totalCount={transactions.length}
              filteredCount={filteredTransactionsCount}
            />
            <TransactionFeed
              transactions={transactions}
              currency={currency}
              onSelectAnomaly={handleSelectAnomalyFromFeed}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          </div>
        )}

        {activeTab === 'ingest' && (
          <div className="space-y-8">
            <IngestSandbox
              currency={currency}
              onAddTransaction={handleAddTransaction}
              onOpenPairDrawer={(leak) => setSelectedLeak(leak)}
            />

            {/* Search Bar & Transaction Feed Preview below Ingest Sandbox */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <TransactionSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                totalCount={transactions.length}
                filteredCount={filteredTransactionsCount}
              />
              <TransactionFeed
                transactions={transactions}
                currency={currency}
                onSelectAnomaly={handleSelectAnomalyFromFeed}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        )}
      </main>

      {/* Google PAIR Human-in-the-Loop Action Drawer Modal */}
      <PairActionDrawer
        leak={selectedLeak}
        currency={currency}
        onClose={() => setSelectedLeak(null)}
        onExecute={handleExecuteSafeguard}
      />

      {/* Minimal Anti-Slop Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-xs text-slate-500 bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Cashflow Copilot · Google PAIR FinTech Reference</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Server: Express on Port 3000</span>
            <span aria-hidden="true">·</span>
            <span>AI: Gemini 2.5 Flash</span>
            <span aria-hidden="true">·</span>
            <span>Security: JWT Bearer Guard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
