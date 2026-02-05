import type { AmountKey } from '@/components/amount-picker-sheet';
import { useRouter } from 'expo-router';

import { useCallback, useEffect, useMemo } from 'react';
import { AmountPickerSheet } from '@/components/amount-picker-sheet';
import { ModalSheet } from '@/components/modal-sheet';
import { SelectPill } from '@/components/select-pill';
import { useAddSubscriptionDraftStore, useCurrencyRatesStore } from '@/lib/stores';

export default function AmountPickerScreen() {
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

      const [, fraction] = prev.split('.');
      if (fraction !== undefined && fraction.length >= 2) {
        return prev;
      }

      return `${prev}${key}`;
    });
  }, [setAmount]);

  return (
    <ModalSheet
      title="Amount"
      closeButtonTitle="Close"
      topRightActionBar={(
        <SelectPill
          value={currencyOption}
          options={currencyOptions}
          onValueChange={option => setCurrency(option?.value ?? '')}
          size="sm"
          variant="muted"
        />
      )}
      snapPoints={['88%']}
      lockSnapPoint
      bottomScrollSpacer={88}
    >
      <AmountPickerSheet
        amountLabel={sheetAmount}
        onKeyPress={handleAmountKeyPress}
        onDone={() => router.back()}
      />
    </ModalSheet>
  );
}
