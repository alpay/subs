import { SwiftUI } from '@mgcrea/react-native-swiftui';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useCallback, useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeSheet } from '@/components/native-sheet';
import {
  SettingsRow,
  SettingsSection,
  SettingsToggleRow,
} from '@/components/settings';
import { SettingsNotificationSection } from '@/components/settings-notification-section';
import { CURRENCIES } from '@/lib/data/currencies';
import { useTheme } from '@/lib/hooks/use-theme';
import { storage } from '@/lib/storage';
import {
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';

function formatLastUpdated(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Never';
  }
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();

  const { settings, update } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { toast } = useToast();
  const { rates, isUpdating, fetchAndUpdateRates } = useCurrencyRatesStore();

  const handleUpdateRates = useCallback(async () => {
    try {
      await fetchAndUpdateRates();
      toast.show('Currency rates updated');
    }
    catch {
      toast.show('Failed to update rates. Check your connection.');
    }
  }, [fetchAndUpdateRates, toast]);

  const currencyFlag = useMemo(() => {
    const entry = CURRENCIES.find(
      c => c.code === settings.mainCurrency?.toUpperCase(),
    );
    return entry?.flag ?? '';
  }, [settings.mainCurrency]);

  const lastUpdatedLabel = useMemo(
    () => formatLastUpdated(rates.updatedAt),
    [rates.updatedAt],
  );

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will clear all data and return to the home screen. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            storage.clearAll();
            await Notifications.cancelAllScheduledNotificationsAsync();
            useSettingsStore.getState().load();
            useCategoriesStore.getState().load();
            useSubscriptionsStore.getState().load();
            usePaymentMethodsStore.getState().load();
            useListsStore.getState().load();
            useCurrencyRatesStore.getState().load();
            useServiceTemplatesStore.getState().load();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <NativeSheet title="Settings">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Developer */}
        <SettingsSection header="Developer" minHeight={150}>
          <SettingsRow
            icon="system:trash"
            label="Reset App"
            buttonColor="red"
            trailingIcon={false}
            onPress={handleResetApp}
          />
          <SettingsToggleRow
            icon="system:crown"
            label="Premium"
            isOn={settings.premium}
            onChange={value => update({ premium: value })}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection
          header="Account"
          footer="Unlock all features with a lifetime license."
          minHeight={150}
        >
          <SettingsRow
            icon="system:sparkles"
            label={(
              <SwiftUI.VStack alignment="leading" spacing={2}>
                <SwiftUI.Text
                  text="Subscription Day"
                  style={{ fontSize: 17, fontWeight: '600' }}
                />
                <SwiftUI.Text
                  text="Account type"
                  style={{ color: colors.textMuted, fontSize: 12 }}
                />
              </SwiftUI.VStack>
            )}
            value={(
              <SwiftUI.Text
                text={settings.premium ? 'Pro' : 'Free'}
                style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}
              />
            )}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/paywall' as const)}
          />
        </SettingsSection>

        {/* General */}
        <SettingsSection header="General" minHeight={200}>
          <SettingsRow
            icon="system:externaldrive"
            label="iCloud & Data"
            value={settings.iCloudEnabled ? 'On' : 'Off'}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/icloud-data')}
          />
          <SettingsRow
            icon="system:dollarsign"
            label="Main Currency"
            value={(
              <SwiftUI.HStack spacing={6}>
                {currencyFlag ? <SwiftUI.Text text={currencyFlag} /> : null}
                <SwiftUI.Text text={settings.mainCurrency} />
              </SwiftUI.HStack>
            )}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/currency')}
          />
          <SettingsToggleRow
            icon="system:number"
            label="Round to Whole Numbers"
            isOn={settings.roundWholeNumbers}
            onChange={value => update({ roundWholeNumbers: value })}
          />
        </SettingsSection>

        {/* Data */}
        <SettingsSection header="Data" minHeight={200}>
          <SettingsRow
            icon="system:list.bullet"
            label="Lists"
            value={String(lists.length)}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/lists')}
          />
          <SettingsRow
            icon="system:square.grid.2x2"
            label="Categories"
            value={String(categories.length)}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/categories')}
          />
          <SettingsRow
            icon="system:creditcard"
            label="Payment Methods"
            value={String(methods.length)}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/payment-methods')}
          />
        </SettingsSection>

        {/* Section 4: Notifications (rounded panel) */}
        <SettingsNotificationSection />

        {/* Interface */}
        <SettingsSection header="Interface" minHeight={150}>
          <SettingsToggleRow
            icon="system:paintbrush.fill"
            label="True Dark Colors"
            isOn={settings.trueDarkColors}
            onChange={value => update({ trueDarkColors: value })}
          />
          <SettingsToggleRow
            icon="system:hand.tap.fill"
            label="Haptic Feedback"
            isOn={settings.hapticsEnabled}
            onChange={value => update({ hapticsEnabled: value })}
          />
        </SettingsSection>

        {/* Currency rates */}
        <SettingsSection
          header="Currency Rates"
          footer="Rates are fetched from a public API (ExchangeRate-API). Tap Update Now to refresh. Values are approximate and may differ from your local rates."
          minHeight={180}
        >
          <SwiftUI.HStack spacing={8}>
            <SwiftUI.VStack alignment="leading" spacing={4}>
              <SwiftUI.Text text="Last updated" />
              <SwiftUI.Text
                text={lastUpdatedLabel}
                style={{ color: colors.textMuted, fontSize: 12 }}
              />
            </SwiftUI.VStack>
            <SwiftUI.Spacer />
            <SwiftUI.Button
              title={isUpdating ? 'Updating...' : 'Update Now'}
              buttonStyle="default"
              style={{ color: colors.text }}
              disabled={isUpdating}
              onPress={handleUpdateRates}
            />
          </SwiftUI.HStack>
        </SettingsSection>

        {/* More */}
        <SettingsSection header="More" minHeight={300}>
          <SettingsRow
            icon="system:star"
            label="Rate & Review"
            trailingIcon="arrow"
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:list.bullet.rectangle"
            label="Ideas & Roadmap"
            trailingIcon="arrow"
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:envelope"
            label="Contact me"
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:globe"
            label="Visit Website"
            trailingIcon="arrow"
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:square.and.arrow.up"
            label="Share with a friend"
            buttonColor={colors.text}
            onPress={() => {}}
          />
        </SettingsSection>

        <View style={{ alignItems: 'center', gap: 6, paddingTop: 8 }}>
          <Image
            source="sf:heart.fill"
            style={{ width: 18, height: 18 }}
            tintColor="#FF4D4F"
          />
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }} selectable>
            Made with love for details at Appps™ © 2026
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }} selectable>
            Version: 1.0
          </Text>
        </View>
      </ScrollView>
    </NativeSheet>
  );
}
