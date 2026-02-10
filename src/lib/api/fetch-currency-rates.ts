import type { CurrencyRates } from '@/lib/db/schema';
import { CURRENCIES } from '@/lib/data/currencies';
import { DEFAULT_CURRENCY_RATES } from '@/lib/data/seed-defaults';

const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/EUR';

type ExchangeRateApiResponse = {
  base: string;
  date: string;
  rates: Record<string, number>;
};

/**
 * Fetches latest currency rates from the public ExchangeRate-API (EUR base).
 * Returns rates for all supported currencies; codes not in the API (e.g. KPW) keep existing values.
 */
export async function fetchCurrencyRates(
  currentRates?: CurrencyRates,
): Promise<CurrencyRates> {
  const res = await fetch(EXCHANGE_RATE_API_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch rates: ${res.status}`);
  }
  const data = (await res.json()) as ExchangeRateApiResponse;
  const fallback = currentRates?.rates ?? DEFAULT_CURRENCY_RATES.rates;
  const rates: Record<string, number> = {};
  for (const { code } of CURRENCIES) {
    rates[code] = data.rates[code] ?? fallback[code] ?? 1;
  }
  const updatedAt = data.date ? `${data.date}T00:00:00Z` : new Date().toISOString();
  return {
    base: data.base ?? 'EUR',
    updatedAt,
    rates,
  };
}
