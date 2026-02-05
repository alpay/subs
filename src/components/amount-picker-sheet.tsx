import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

const AMOUNT_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
] as const;

export type AmountKey = (typeof AMOUNT_KEYS)[number][number];

type AmountPickerSheetProps = {
  amountLabel: string;
  onKeyPress: (key: AmountKey) => void;
  onDone: () => void;
};

export function AmountPickerSheet({
  amountLabel,
  onKeyPress,
  onDone,
}: AmountPickerSheetProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingTop: 4,
        gap: 18,
      }}
    >
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
          $
          {amountLabel}
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
