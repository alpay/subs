import { useRouter } from 'expo-router';
import { Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useCurrencyRatesStore, useListsStore, usePaymentMethodsStore, useSettingsStore } from '@/lib/stores';

export default function SettingsScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { settings, update } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { rates } = useCurrencyRatesStore();
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background, paddingTop: top }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Close
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Settings
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Subs
          </Text>
          <Text className="mt-1 text-xs" style={{ color: colors.secondaryText }}>
            Free
          </Text>
        </View>

        <View className="mt-4 rounded-3xl px-4 py-2" style={{ backgroundColor: colors.card }}>
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              iCloud & Data
            </Text>
            <Switch
              value={settings.iCloudEnabled}
              onValueChange={value => update({ iCloudEnabled: value })}
            />
          </View>
          <Pressable
            onPress={() => router.push('/(modals)/currency')}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-sm" style={{ color: colors.text }}>
              Main Currency
            </Text>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              {settings.mainCurrency}
            </Text>
          </Pressable>
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              Round to Whole Numbers
            </Text>
            <Switch
              value={settings.roundWholeNumbers}
              onValueChange={value => update({ roundWholeNumbers: value })}
            />
          </View>
        </View>

        <View className="mt-4 rounded-3xl px-4 py-2" style={{ backgroundColor: colors.card }}>
          <Pressable onPress={() => router.push('/(modals)/categories')} className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              Categories
            </Text>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              {categories.length}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(modals)/lists')} className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              Lists
            </Text>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              {lists.length}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(modals)/payment-methods')} className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              Payment Methods
            </Text>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              {methods.length}
            </Text>
          </Pressable>
        </View>

        <View className="mt-4 rounded-3xl px-4 py-2" style={{ backgroundColor: colors.card }}>
          <Pressable onPress={() => router.push('/(modals)/notification-settings')} className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              Notifications
            </Text>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Default
            </Text>
          </Pressable>
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              True Dark Colors
            </Text>
            <Switch
              value={settings.trueDarkColors}
              onValueChange={value => update({ trueDarkColors: value })}
            />
          </View>
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm" style={{ color: colors.text }}>
              Haptic Feedback
            </Text>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={value => update({ hapticsEnabled: value })}
            />
          </View>
        </View>

        <View className="mt-4 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-xs" style={{ color: colors.secondaryText }}>
            Currency rates
          </Text>
          <Text className="mt-2 text-sm" style={{ color: colors.text }}>
            Last update:
            {' '}
            {new Date(rates.updatedAt).toLocaleString()}
          </Text>
          <Pressable
            onPress={() => router.push('/(modals)/currency')}
            className="mt-3 items-center justify-center rounded-2xl px-4 py-2"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-sm" style={{ color: colors.text }}>
              Update Now
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
