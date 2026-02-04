import type { CurrencyRates } from '@/lib/db/schema';

export type ConvertCurrencyInput = {
  amount: number;
  from: string;
  to: string;
  rates: CurrencyRates;
};

export function convertCurrency({ amount, from, to, rates }: ConvertCurrencyInput) {
  if (from === to) {
    return amount;
  }

  const base = rates.base;
  const rateMap = rates.rates || {};

  const toBase = (value: number, currency: string) => {
    if (currency === base) {
      return value;
    }
    const rate = rateMap[currency];
    if (!rate) {
      return value;
    }
    return value / rate;
  };

  const fromBase = (value: number, currency: string) => {
    if (currency === base) {
      return value;
    }
    const rate = rateMap[currency];
    if (!rate) {
      return value;
    }
    return value * rate;
  };

  const baseAmount = toBase(amount, from);
  return fromBase(baseAmount, to);
}

export function roundCurrency(amount: number, roundWholeNumbers: boolean) {
  if (roundWholeNumbers) {
    return Math.round(amount);
  }
  return Math.round(amount * 100) / 100;
}
