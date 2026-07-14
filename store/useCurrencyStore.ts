'use client';

import { create } from 'zustand';

interface CurrencyRates {
  USD: number;
  EUR: number;
  GBP: number;
  TRY: number;
}

interface CurrencyStore {
  rates: CurrencyRates;
  displayCurrency: 'USD' | 'EUR' | 'TRY';
  lastUpdated: string | null;
  isLive: boolean;
  setRates: (rates: Partial<CurrencyRates>) => void;
  setDisplayCurrency: (cur: 'USD' | 'EUR' | 'TRY') => void;
  convert: (amount: number, from: string, to: string) => number;
  format: (amount: number, currency: string) => string;
  convertAndFormat: (amount: number, from: string, to: string) => string;
}

const DEFAULT_RATES: CurrencyRates = {
  USD: 38.5,
  EUR: 42.0,
  GBP: 48.5,
  TRY: 1,
};

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  rates: DEFAULT_RATES,
  displayCurrency: 'USD',
  lastUpdated: null,
  isLive: false,

  setRates: (newRates) =>
    set((s) => ({
      rates: { ...s.rates, ...newRates },
      lastUpdated: new Date().toLocaleTimeString('tr-TR'),
      isLive: true,
    })),

  setDisplayCurrency: (cur) => set({ displayCurrency: cur }),

  convert: (amount, from, to) => {
    const { rates } = get();
    if (from === to) return amount;
    const fromRate = rates[from as keyof CurrencyRates] ?? 1;
    const toRate = rates[to as keyof CurrencyRates] ?? 1;
    // Convert to TRY first, then to target
    const inTRY = amount * fromRate;
    return inTRY / toRate;
  },

  format: (amount, currency) => {
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency}`;
    }
  },

  convertAndFormat: (amount, from, to) => {
    const { convert, format } = get();
    return format(convert(amount, from, to), to);
  },
}));
