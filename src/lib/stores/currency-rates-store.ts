import type { CurrencyRates } from '@/lib/db/schema';

import { create } from 'zustand';
import { DEFAULT_CURRENCY_RATES } from '@/lib/data/seed-defaults';
import { getCurrencyRates, saveCurrencyRates } from '@/lib/db/storage';

const bundledRates = DEFAULT_CURRENCY_RATES;

type CurrencyRatesState = {
  rates: CurrencyRates;
  isLoaded: boolean;
  load: () => void;
  refreshFromBundle: () => void;
  setRates: (rates: CurrencyRates) => void;
};

export const useCurrencyRatesStore = create<CurrencyRatesState>(set => ({
  rates: bundledRates,
  isLoaded: false,
  load: () => {
    const stored = getCurrencyRates();
    set({ rates: stored, isLoaded: true });
  },
  refreshFromBundle: () => {
    const updated = { ...bundledRates, updatedAt: new Date().toISOString() };
    saveCurrencyRates(updated);
    set({ rates: updated });
  },
  setRates: (rates) => {
    saveCurrencyRates(rates);
    set({ rates });
  },
}));
