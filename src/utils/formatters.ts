import { CurrencyCode, CURRENCIES } from '../types';

export function formatCurrency(amountINR: number, currency: CurrencyCode = 'INR'): string {
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  const converted = amountINR * config.rateFromINR;

  if (currency === 'INR') {
    return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  } else if (currency === 'USD') {
    return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `€${converted.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatCompactCurrency(amountINR: number, currency: CurrencyCode = 'INR'): string {
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  const converted = amountINR * config.rateFromINR;

  if (currency === 'INR') {
    if (converted >= 100000) {
      return `₹${(converted / 100000).toFixed(1)}L`;
    }
    if (converted >= 1000) {
      return `₹${(converted / 1000).toFixed(1)}k`;
    }
    return `₹${Math.round(converted)}`;
  } else if (currency === 'USD') {
    if (converted >= 1000) {
      return `$${(converted / 1000).toFixed(1)}k`;
    }
    return `$${Math.round(converted)}`;
  } else {
    if (converted >= 1000) {
      return `€${(converted / 1000).toFixed(1)}k`;
    }
    return `€${Math.round(converted)}`;
  }
}

export function getMerchantInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function getMerchantBgColor(name: string): string {
  const colors = [
    'bg-blue-950/80 text-blue-300 border-blue-800/60',
    'bg-purple-950/80 text-purple-300 border-purple-800/60',
    'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    'bg-amber-950/80 text-amber-300 border-amber-800/60',
    'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    'bg-rose-950/80 text-rose-300 border-rose-800/60',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % colors.length;
  }
  return colors[hash];
}
