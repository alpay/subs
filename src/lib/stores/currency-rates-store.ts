import { create } from 'zustand';

import type { CurrencyRates } from '@/lib/db/schema';
import { getCurrencyRates, saveCurrencyRates } from '@/lib/db/storage';
import { DEFAULT_CURRENCY_RATES } from '@/lib/data/seed-defaults';

const bundledRates = DEFAULT_CURRENCY_RATES;

type CurrencyRatesState = {
  rates: CurrencyRates;
  isLoaded: boolean;
  load: () => void;
  refreshFromBundle: () => void;
  setRates: (rates: CurrencyRates) => void;
};

export const useCurrencyRatesStore = create<CurrencyRatesState>((set, get) => ({
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
