import type { AmountKey } from '@/components/amount-picker-sheet';
import { useRouter } from 'expo-router';

import { useCallback, useEffect, useMemo } from 'react';
import { AmountPickerSheet } from '@/components/amount-picker-sheet';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useAddSubscriptionDraftStore, useCurrencyRatesStore } from '@/lib/stores';

export default function AmountPickerScreen() {
  useBootstrap();
  const router = useRouter();
  const { rates } = useCurrencyRatesStore();
  const { amount, currency, setAmount, setCurrency } = useAddSubscriptionDraftStore();

  const sheetAmount = amount.trim().length > 0 ? amount : '0';

  const currencyOptions = useMemo(
    () => Object.keys(rates.rates).sort().map(code => ({ label: code, value: code })),
    [rates.rates],
  );

  const currencyOption = useMemo(
    () => currencyOptions.find(option => option.value === currency),
    [currency, currencyOptions],
  );

  useEffect(() => {
    if (currencyOptions.length > 0 && !currencyOptions.some(option => option.value === currency)) {
      setCurrency(currencyOptions[0].value);
    }
  }, [currency, currencyOptions, setCurrency]);

  const handleAmountKeyPress = useCallback((key: AmountKey) => {
    setAmount((prev) => {
      if (key === 'back') {
        const next = prev.length > 1 ? prev.slice(0, -1) : '0';
        return next === '' ? '0' : next;
      }

      if (key === '.') {
        if (prev.includes('.')) {
          return prev;
        }
        return `${prev}.`;
      }

      if (prev === '0') {
        return key;
      }

      const [whole, fraction] = prev.split('.');
      if (fraction !== undefined && fraction.length >= 2) {
        return prev;
      }

      return `${prev}${key}`;
    });
  }, [setAmount]);

  return (
    <AmountPickerSheet
      amountLabel={sheetAmount}
      currencyOption={currencyOption}
      currencyOptions={currencyOptions}
      onCurrencyChange={setCurrency}
      onKeyPress={handleAmountKeyPress}
      onClose={() => router.back()}
    />
  );
}
