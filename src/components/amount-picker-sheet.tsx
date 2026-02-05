import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';

import { SelectPill } from './select-pill';

const AMOUNT_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
] as const;

export type AmountKey = (typeof AMOUNT_KEYS)[number][number];

type SelectOption = {
  label: string;
  value: string;
};

type AmountPickerSheetProps = {
  amountLabel: string;
  currencyOption?: SelectOption;
  currencyOptions: SelectOption[];
  onCurrencyChange: (value: string) => void;
  onKeyPress: (key: AmountKey) => void;
  onClose: () => void;
};

export function AmountPickerSheet({
  amountLabel,
  currencyOption,
  currencyOptions,
  onCurrencyChange,
  onKeyPress,
  onClose,
}: AmountPickerSheetProps) {
  const { colors, isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: bottom + 16,
        gap: 18,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <SelectPill
          value={currencyOption}
          options={currencyOptions}
          onValueChange={option => onCurrencyChange(option?.value ?? '')}
          size="sm"
          variant="muted"
        />

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            {
              width: 32,
              height: 32,
              borderRadius: 16,
              borderCurve: 'continuous',
              backgroundColor: colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Image
            source="sf:xmark"
            style={{ width: 12, height: 12 }}
            tintColor={colors.textMuted}
          />
        </Pressable>
      </View>

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
          ${amountLabel}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {AMOUNT_KEYS.map(row => (
          <View key={row.join('-')} style={{ flexDirection: 'row', gap: 12 }}>
            {row.map(key => {
              const isBackspace = key === 'back';
              return (
                <Pressable
                  key={key}
                  onPress={() => onKeyPress(key)}
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
        onPress={onClose}
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
