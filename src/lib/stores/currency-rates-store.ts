import type { CurrencyRates } from '@/lib/db/schema';

import { create } from 'zustand';
import { fetchCurrencyRates } from '@/lib/api/fetch-currency-rates';
import { DEFAULT_CURRENCY_RATES } from '@/lib/data/seed-defaults';
import { getCurrencyRates, saveCurrencyRates } from '@/lib/db/storage';

const bundledRates = DEFAULT_CURRENCY_RATES;

type CurrencyRatesState = {
  rates: CurrencyRates;
  isLoaded: boolean;
  isUpdating: boolean;
  load: () => void;
  refreshFromBundle: () => void;
  setRates: (rates: CurrencyRates) => void;
  fetchAndUpdateRates: () => Promise<void>;
};

export const useCurrencyRatesStore = create<CurrencyRatesState>(set => ({
  rates: bundledRates,
  isLoaded: false,
  isUpdating: false,
  /** Hydrate from storage (stored rates if any, else bundled default for offline/first launch). */
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
  /** Fetch from API and persist to storage; "last updated" in settings reflects this. */
  fetchAndUpdateRates: async () => {
    set({ isUpdating: true });
    try {
      const current = getCurrencyRates();
      const next = await fetchCurrencyRates(current);
      saveCurrencyRates(next);
      set({ rates: next });
    }
    finally {
      set({ isUpdating: false });
    }
  },
}));
