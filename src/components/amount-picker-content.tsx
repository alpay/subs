import { Button, Host, Menu } from '@expo/ui/swift-ui';
import { buttonStyle, fixedSize, labelStyle } from '@expo/ui/swift-ui/modifiers';
import { Image } from 'expo-image';

import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { getCurrencySymbol } from '@/lib/data/currencies';
import { Haptic } from '@/lib/haptics';
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
  const { t } = useTranslation();
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
    Haptic.Light();
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
          {t('amount_picker.amount_label')}
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
        onPress={() => {
          Haptic.Light();
          onDone();
        }}
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
          {t('common.done')}
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
  const { t } = useTranslation();
  const currencyOption = useMemo(
    () => currencyOptions.find(option => option.value === currency),
    [currency, currencyOptions],
  );
  return (
    <Host matchContents>
      <Menu
        systemImage="chevron.up.chevron.down"
        label={currencyOption?.label ?? t('common.currency')}
        modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass')]}
      >
        {currencyOptions.map(option => (
          <Button
            key={option.value}
            systemImage={option.value === currency ? 'checkmark' : undefined}
            label={option.label}
            onPress={() => {
              Haptic.Light();
              setCurrency(option.value);
            }}
          />
        ))}
      </Menu>
    </Host>
  );
}
