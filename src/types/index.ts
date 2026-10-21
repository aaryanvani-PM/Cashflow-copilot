export type CurrencyCode = 'INR' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromINR: number; // 1 INR = X currency
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.011 },
};

export type LeakCategory = 'price_creep' | 'reward_optimizer' | 'zombie_trial';

export interface StagedRemediation {
  merchantEmail: string;
  emailSubject: string;
  emailBody: string;
  virtualCardAction: 'freeze' | 'cap_limit' | 'block_merchant' | 'switch_default';
  cardSpendCeiling?: number;
  suggestedCard?: string;
  requiresHumanConfirm: boolean;
}

export interface FinancialLeak {
  id: string;
  title: string;
  subtitle: string;
  category: LeakCategory;
  monthlyImpactINR: number;
  annualSavingsINR: number;
  merchantName: string;
  severity: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0 to 100
  status: 'active' | 'staged' | 'executed' | 'dismissed';
  details: {
    previousAmountINR?: number;
    newAmountINR?: number;
    percentageIncrease?: number;
    cardUsed?: string;
    recommendedCard?: string;
    missedMultiplier?: string;
    missedPointsValueINR?: number;
    daysInactive?: number;
    renewalDate?: string;
  };
  pairExplanation: string;
  stagedRemediation: StagedRemediation;
  executedAt?: string;
  receiptId?: string;
}

export interface Transaction {
  id: string;
  rawString: string;
  merchantName: string;
  category: string;
  amountINR: number;
  date: string;
  timestamp: string;
  paymentMethod: {
    name: string;
    last4: string;
    type: 'Credit Card' | 'Debit Card' | 'UPI' | 'Virtual Card';
  };
  recurrence: 'monthly' | 'annual' | 'one_off' | 'trial';
  fxMarkupPercent?: number;
  anomalyTag?: LeakCategory | 'fx_markup' | null;
  status: 'cleared' | 'flagged' | 'mitigated';
  confidenceLevel?: 'High' | 'Med' | 'Low';
  confidencePercentage?: number;
  notes?: string;
}

export interface ParsedTransactionResult {
  merchantName: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  cardLast4: string;
  recurrence: 'monthly' | 'annual' | 'one_off' | 'trial';
  anomalyType: LeakCategory | 'fx_markup' | 'none';
  anomalySeverity: 'none' | 'low' | 'medium' | 'high';
  leakEstimatedSavingsINR: number;
  confidence: number;
  explanation: string;
  suggestedAction: string;
  rawText: string;
}
