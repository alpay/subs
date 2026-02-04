import { useRouter } from 'expo-router';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useCurrencyRatesStore, useSettingsStore } from '@/lib/stores';

export default function CurrencyScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { settings, update } = useSettingsStore();
  const { rates, refreshFromBundle } = useCurrencyRatesStore();

  const currencies = Object.keys(rates.rates);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Close
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Main Currency
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6">
          {currencies.map(code => (
            <Pressable
              key={code}
              onPress={() => update({ mainCurrency: code })}
              className="mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3"
              style={{ backgroundColor: colors.card }}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                {code}
              </Text>
              {settings.mainCurrency === code && (
                <Text className="text-xs" style={{ color: colors.primary }}>
                  Selected
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={refreshFromBundle}
          className="mt-2 items-center justify-center rounded-2xl px-4 py-3"
          style={{ backgroundColor: colors.card }}
        >
          <Text className="text-sm" style={{ color: colors.text }}>
            Update Now
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
