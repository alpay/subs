import { SwiftUI } from '@mgcrea/react-native-swiftui';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useCallback, useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeSheet } from '@/components/native-sheet';
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
            router.replace('/(app)');
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
          paddingHorizontal: 8,
          paddingBottom: bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Developer - SwiftUI Form (requires explicit height in ScrollView) */}
        <View style={{ marginBottom: 20 }}>
          <SwiftUI style={{ flex: 1, minHeight: 150 }}>
            <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
              <SwiftUI.Section
                header="Developer"
              >
                <SwiftUI.Button
                  style={{ color: 'red' }}
                  onPress={handleResetApp}
                >
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:trash" />
                    <SwiftUI.Text text="Reset App" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.HStack spacing={8}>
                  <SwiftUI.Image name="system:crown" />
                  <SwiftUI.Text text="Premium" />
                  <SwiftUI.Spacer />
                  <SwiftUI.Toggle
                    label=""
                    isOn={settings.premium}
                    onChange={value => update({ premium: value })}
                  />
                </SwiftUI.HStack>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI>
        </View>

        {/* Section 1: Account - SwiftUI Form */}
        <View style={{ marginBottom: 20 }}>
          <SwiftUI style={{ flex: 1, minHeight: 150 }}>
            <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
              <SwiftUI.Section
                header="Account"
                footer="Unlock all features with a lifetime license."
              >
                <SwiftUI.Button buttonStyle="plain" onPress={() => {}}>
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:sparkles" />
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
                    <SwiftUI.Spacer />
                    <SwiftUI.Text
                      text="Free"
                      style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}
                    />
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI>
        </View>

        {/* Section 2: General - SwiftUI Form */}
        <View style={{ marginBottom: 20 }}>
          <SwiftUI style={{ flex: 1, minHeight: 200 }}>
            <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
              <SwiftUI.Section header="General">
                <SwiftUI.Button
                  buttonStyle="plain"
                  onPress={() => update({ iCloudEnabled: !settings.iCloudEnabled })}
                >
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:externaldrive" />
                    <SwiftUI.Text text="iCloud & Data" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Text
                      text={settings.iCloudEnabled ? 'On' : 'Off'}
                      style={{ color: colors.textMuted }}
                    />
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.Button
                  buttonStyle="plain"
                  onPress={() => router.push('/(app)/settings/currency')}
                >
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:dollarsign" />
                    <SwiftUI.Text text="Main Currency" />
                    <SwiftUI.Spacer />
                    <SwiftUI.HStack spacing={6}>
                      {currencyFlag
                        ? <SwiftUI.Text text={currencyFlag} />
                        : null}
                      <SwiftUI.Text text={settings.mainCurrency} />
                    </SwiftUI.HStack>
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.HStack spacing={8}>
                  <SwiftUI.Image name="system:number" />
                  <SwiftUI.Text text="Round to Whole Numbers" />
                  <SwiftUI.Spacer />
                  <SwiftUI.Toggle
                    label=""
                    isOn={settings.roundWholeNumbers}
                    onChange={value => update({ roundWholeNumbers: value })}
                  />
                </SwiftUI.HStack>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI>
        </View>

        {/* Section 3: Lists, Categories & Payment Methods - SwiftUI Form */}
        <View style={{ marginBottom: 20 }}>
          <SwiftUI style={{ flex: 1, minHeight: 200 }}>
            <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
              <SwiftUI.Section header="Data">
                <SwiftUI.Button
                  buttonStyle="plain"
                  onPress={() => router.push('/(app)/settings/lists')}
                >
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:list.bullet" />
                    <SwiftUI.Text text="Lists" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Text
                      text={String(lists.length)}
                      style={{ color: colors.textMuted }}
                    />
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.Button
                  buttonStyle="plain"
                  onPress={() => router.push('/(app)/settings/categories')}
                >
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:square.grid.2x2" />
                    <SwiftUI.Text text="Categories" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Text
                      text={String(categories.length)}
                      style={{ color: colors.textMuted }}
                    />
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.Button
                  buttonStyle="plain"
                  onPress={() => router.push('/(app)/settings/payment-methods')}
                >
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:creditcard" />
                    <SwiftUI.Text text="Payment Methods" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Text
                      text={String(methods.length)}
                      style={{ color: colors.textMuted }}
                    />
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI>
        </View>

        {/* Section 4: Notifications (rounded panel) */}
        <SettingsNotificationSection />

        {/* Section 5: Interface - SwiftUI Form */}
        <View style={{ marginBottom: 20 }}>
          <SwiftUI style={{ flex: 1, minHeight: 150 }}>
            <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
              <SwiftUI.Section header="Interface">
                <SwiftUI.HStack spacing={8}>
                  <SwiftUI.Image name="system:paintbrush.fill" />
                  <SwiftUI.Text text="True Dark Colors" />
                  <SwiftUI.Spacer />
                  <SwiftUI.Toggle
                    label=""
                    isOn={settings.trueDarkColors}
                    onChange={value => update({ trueDarkColors: value })}
                  />
                </SwiftUI.HStack>
                <SwiftUI.HStack spacing={8}>
                  <SwiftUI.Image name="system:hand.tap.fill" />
                  <SwiftUI.Text text="Haptic Feedback" />
                  <SwiftUI.Spacer />
                  <SwiftUI.Toggle
                    label=""
                    isOn={settings.hapticsEnabled}
                    onChange={value => update({ hapticsEnabled: value })}
                  />
                </SwiftUI.HStack>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI>
        </View>

        {/* Currency rates - SwiftUI Form */}
        <View style={{ marginBottom: 20 }}>
          <SwiftUI style={{ flex: 1, minHeight: 180 }}>
            <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
              <SwiftUI.Section
                header="Currency Rates"
                footer="Rates are fetched from a public API (ExchangeRate-API). Tap Update Now to refresh. Values are approximate and may differ from your local rates."
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
                    disabled={isUpdating}
                    onPress={handleUpdateRates}
                  />
                </SwiftUI.HStack>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI>
        </View>

        {/* More: Rate & Review, etc. - SwiftUI Form */}
        <View style={{ marginBottom: 20 }}>
          <SwiftUI style={{ flex: 1, minHeight: 300 }}>
            <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
              <SwiftUI.Section header="More">
                <SwiftUI.Button buttonStyle="plain" onPress={() => {}}>
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:star" />
                    <SwiftUI.Text text="Rate & Review" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Image name="system:arrow.up.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.Button buttonStyle="plain" onPress={() => {}}>
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:list.bullet.rectangle" />
                    <SwiftUI.Text text="Ideas & Roadmap" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Image name="system:arrow.up.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.Button buttonStyle="plain" onPress={() => {}}>
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:envelope" />
                    <SwiftUI.Text text="Contact me" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.Button buttonStyle="plain" onPress={() => {}}>
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:globe" />
                    <SwiftUI.Text text="Visit Website" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Image name="system:arrow.up.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
                <SwiftUI.Button buttonStyle="plain" onPress={() => {}}>
                  <SwiftUI.HStack spacing={8}>
                    <SwiftUI.Image name="system:square.and.arrow.up" />
                    <SwiftUI.Text text="Share with a friend" />
                    <SwiftUI.Spacer />
                    <SwiftUI.Image name="system:chevron.right" />
                  </SwiftUI.HStack>
                </SwiftUI.Button>
              </SwiftUI.Section>
            </SwiftUI.Form>
          </SwiftUI>
        </View>

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
