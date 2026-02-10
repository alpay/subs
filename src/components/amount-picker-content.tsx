import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SelectPill } from '@/components/select-pill';
import { getCurrencySymbol } from '@/lib/data/currencies';
import { useTheme } from '@/lib/hooks/use-theme';
import { useAddSubscriptionDraftStore, useCurrencyRatesStore, useSettingsStore } from '@/lib/stores';

const AMOUNT_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
] as const;

type AmountKey = (typeof AMOUNT_KEYS)[number][number];

type AmountPickerContentProps = {
  onDone: () => void;
};

export function AmountPickerContent({ onDone }: AmountPickerContentProps) {
  const { colors, isDark } = useTheme();
  const { rates } = useCurrencyRatesStore();
  const { settings } = useSettingsStore();
  const { amount, currency, setAmount, setCurrency } = useAddSubscriptionDraftStore();

  const sheetAmount = amount.trim().length > 0 ? amount : '0';

  const currencyOptions = useMemo(() => {
    const favorites = settings.favoriteCurrencies ?? [];
    const inRates = new Set(Object.keys(rates.rates));
    const codes = favorites.filter(code => inRates.has(code)).sort();
    const list = codes.length === 0 ? Object.keys(rates.rates).sort() : codes;
    return list.map(code => ({ label: `${code} (${getCurrencySymbol(code)})`, value: code }));
  }, [rates.rates, settings.favoriteCurrencies]);

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
    <View style={{ gap: 18 }}>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 12, letterSpacing: 1.4, color: colors.textMuted }} selectable>
          AMOUNT
        </Text>
        <Text
          style={{
            fontSize: 54,
            fontWeight: '600',
            color: colors.text,
            fontVariant: ['tabular-nums'],
          }}
          selectable
        >
          {getCurrencySymbol(currency)}
          {sheetAmount}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {AMOUNT_KEYS.map(row => (
          <View key={row.join('-')} style={{ flexDirection: 'row', gap: 12 }}>
            {row.map((key) => {
              const isBackspace = key === 'back';
              return (
                <Pressable
                  key={key}
                  onPress={() => handleAmountKeyPress(key)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      height: 56,
                      borderRadius: 18,
                      borderCurve: 'continuous',
                      backgroundColor: colors.surfaceMuted,
                      borderWidth: 1,
                      borderColor: colors.surfaceBorder,
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isDark
                        ? '0 8px 14px rgba(0, 0, 0, 0.25)'
                        : '0 8px 14px rgba(15, 23, 42, 0.08)',
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  {isBackspace
                    ? (
                        <Image
                          source="sf:delete.left"
                          style={{ width: 20, height: 20 }}
                          tintColor={colors.text}
                        />
                      )
                    : (
                        <Text
                          style={{ fontSize: 20, fontWeight: '600', color: colors.text }}
                          selectable
                        >
                          {key}
                        </Text>
                      )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Pressable
        onPress={onDone}
        style={({ pressed }) => [
          {
            marginTop: 8,
            borderRadius: 999,
            borderCurve: 'continuous',
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#F5F5F5' : colors.text,
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#1C1C1E' : colors.background,
          }}
          selectable
        >
          Done
        </Text>
      </Pressable>
    </View>
  );
}

/** For use inside ModalSheet - pass as topRightActionBar when using this content. Shows only favorite currencies. */
export function AmountPickerCurrencyPill() {
  const { rates } = useCurrencyRatesStore();
  const { settings } = useSettingsStore();
  const { currency, setCurrency } = useAddSubscriptionDraftStore();
  const currencyOptions = useMemo(() => {
    const favorites = settings.favoriteCurrencies ?? [];
    const inRates = new Set(Object.keys(rates.rates));
    const codes = favorites.filter(code => inRates.has(code)).sort();
    const list = codes.length === 0 ? Object.keys(rates.rates).sort() : codes;
    return list.map(code => ({ label: `${code} (${getCurrencySymbol(code)})`, value: code }));
  }, [rates.rates, settings.favoriteCurrencies]);
  const currencyOption = useMemo(
    () => currencyOptions.find(option => option.value === currency),
    [currency, currencyOptions],
  );
  return (
    <SelectPill
      value={currencyOption}
      options={currencyOptions}
      onValueChange={option => setCurrency(option?.value ?? '')}
      size="sm"
      variant="muted"
    />
  );
}
