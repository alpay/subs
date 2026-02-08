import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { Switch, useToast } from 'heroui-native';
import { useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModalSheet } from '@/components/modal-sheet';
import { Pill } from '@/components/pill';
import {
  SettingsLeadingIcon,
  SettingsRow,
  SettingsRowDivider,
  SettingsSection,
} from '@/components/settings-section';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';
import { storage } from '@/lib/storage';

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '\u{1F1FA}\u{1F1F8}',
  EUR: '\u{1F1EA}\u{1F1FA}',
  GBP: '\u{1F1EC}\u{1F1E7}',
  JPY: '\u{1F1EF}\u{1F1F5}',
  AUD: '\u{1F1E6}\u{1F1FA}',
  CAD: '\u{1F1E8}\u{1F1E6}',
  CHF: '\u{1F1E8}\u{1F1ED}',
};

function formatReminderLabel(days: number) {
  if (days === 0) {
    return 'Same Day';
  }
  return `${days} Day${days === 1 ? '' : 's'}`;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

const ICON_DIVIDER_INSET = 36;

function SubscriptionBadge() {
  const { colors, isDark } = useTheme();

  return (
    <LinearGradient
      colors={['#F9D976', '#F39F3D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        borderCurve: 'continuous',
        boxShadow: isDark
          ? '0 10px 18px rgba(0, 0, 0, 0.35)'
          : '0 10px 18px rgba(15, 23, 42, 0.18)',
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          borderCurve: 'continuous',
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        }}
      >
        <Image
          source="sf:sparkles"
          style={{ width: 18, height: 18 }}
          tintColor={colors.text}
        />
      </View>
    </LinearGradient>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();

  const { settings, update } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { methods } = usePaymentMethodsStore();
  const { rates, refreshFromBundle } = useCurrencyRatesStore();

  const currencyFlag = useMemo(() => {
    const key = settings.mainCurrency?.toUpperCase();
    return key ? CURRENCY_FLAGS[key] : '';
  }, [settings.mainCurrency]);

  const updatedAtLabel = useMemo(() => formatUpdatedAt(rates.updatedAt), [rates.updatedAt]);
  const firstReminderLabel = formatReminderLabel(settings.notificationDefaults.first.daysBefore);
  const secondReminderLabel = settings.notificationDefaults.second
    ? formatReminderLabel(settings.notificationDefaults.second.daysBefore)
    : 'Never';

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

  const handleTestNotification = async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      let status = current.status;
      if (status !== 'granted') {
        const request = await Notifications.requestPermissionsAsync();
        status = request.status;
      }
      if (status !== 'granted') {
        toast.show('Enable notifications in Settings to test alerts.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'Notifications are enabled.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });
      toast.show('Test notification scheduled');
    }
    catch {
      toast.show('Unable to schedule a test notification');
    }
  };

  const sectionLabelStyle = { fontSize: 11, letterSpacing: 1.2, color: colors.textMuted, fontWeight: '600' as const };
  const noteStyle = { fontSize: 12, color: colors.textMuted, lineHeight: 18 };

  return (
    <ModalSheet
      title="Settings"
      closeVariant="muted"
      contentContainerStyle={{
        gap: 0,
        padding: 0,
        paddingTop: 4,
        paddingHorizontal: 20,
        paddingBottom: bottom + 20,
      }}
    >
      {/* Developer */}
      <View style={{ marginBottom: 8 }}>
        <Text style={[sectionLabelStyle, { marginBottom: 8 }]} selectable>
          DEVELOPER
        </Text>
      </View>
      <SettingsSection>
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="trash" />}
          label="Reset App"
          subtitle="Clear all data and return to home"
          labelTone="accent"
          onPress={handleResetApp}
        />
        <SettingsRowDivider inset={ICON_DIVIDER_INSET} />
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="crown" />}
          label="Premium"
          right={(
            <Switch
              isSelected={settings.premium}
              onSelectedChange={isSelected => update({ premium: isSelected })}
            />
          )}
        />
      </SettingsSection>

      {/* Section 1: Account (rounded panel with light background) */}
      <SettingsSection>
        <SettingsRow
          leading={<SubscriptionBadge />}
          label="Subscription Day"
          subtitle="Account type"
          labelStyle={{ fontSize: 17, fontWeight: '600' }}
          right={<Pill tone="accent">Free</Pill>}
          accessorySymbol="chevron.right"
        />
        <View style={{ paddingHorizontal: 14, paddingBottom: 10 }}>
          <Text style={[noteStyle, { marginTop: 2 }]} selectable>
            Unlock all features with a lifetime license.
          </Text>
        </View>
      </SettingsSection>

      {/* Section 2: General (rounded panel) */}
      <SettingsSection>
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="externaldrive" />}
          label="iCloud & Data"
          right={(
            <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
              {settings.iCloudEnabled ? 'On' : 'Off'}
            </Text>
          )}
          accessorySymbol="chevron.right"
          onPress={() => update({ iCloudEnabled: !settings.iCloudEnabled })}
        />
        <SettingsRowDivider />
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="dollarsign" />}
          label="Main Currency"
          onPress={() => router.push('/(app)/settings/currency')}
          right={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {currencyFlag
                ? (
                    <Text style={{ fontSize: 16 }} selectable>
                      {currencyFlag}
                    </Text>
                  )
                : null}
              <Text style={{ color: colors.text, fontVariant: ['tabular-nums'] }} selectable>
                {settings.mainCurrency}
              </Text>
            </View>
          )}
          accessorySymbol="chevron.right"
        />
        <SettingsRowDivider />
        <SettingsRow
          label="Round to Whole Numbers"
          right={(
            <Switch
              isSelected={settings.roundWholeNumbers}
              onSelectedChange={isSelected => update({ roundWholeNumbers: isSelected })}
            />
          )}
        />
      </SettingsSection>

      {/* Section 3: Categories & Payment Methods (rounded panel) */}
      <SettingsSection>
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="square.grid.2x2" />}
          label="Categories"
          onPress={() => router.push('/(app)/settings/categories')}
          right={(
            <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
              {categories.length}
            </Text>
          )}
          accessorySymbol="chevron.right"
        />
        <SettingsRowDivider inset={ICON_DIVIDER_INSET} />
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="creditcard" />}
          label="Payment Methods"
          onPress={() => router.push('/(app)/settings/payment-methods')}
          right={(
            <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
              {methods.length}
            </Text>
          )}
          accessorySymbol="chevron.right"
        />
      </SettingsSection>

      {/* Section 4: Notifications (rounded panel) */}
      <View style={{ marginBottom: 8 }}>
        <Text style={[sectionLabelStyle, { marginBottom: 8 }]} selectable>
          NOTIFICATIONS.
        </Text>
      </View>
      <SettingsSection>
        <SettingsRow
          label="First Reminder"
          onPress={() => router.push('/(app)/settings/notification-settings')}
          right={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
                  {firstReminderLabel}
                </Text>
                <Image
                  source="sf:chevron.up.chevron.down"
                  style={{ width: 10, height: 10 }}
                  tintColor={colors.textMuted}
                />
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  backgroundColor: colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <Text
                  style={{ color: colors.text, fontSize: 12, fontVariant: ['tabular-nums'] }}
                  selectable
                >
                  {settings.notificationDefaults.first.time}
                </Text>
              </View>
            </View>
          )}
        />
        <SettingsRowDivider />
        <SettingsRow
          label="Second Reminder"
          onPress={() => router.push('/(app)/settings/notification-settings')}
          right={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
                {secondReminderLabel}
              </Text>
              <Image
                source="sf:chevron.up.chevron.down"
                style={{ width: 10, height: 10 }}
                tintColor={colors.textMuted}
              />
            </View>
          )}
        />
        <SettingsRowDivider />
        <SettingsRow
          label="Test Notification"
          labelTone="accent"
          labelStyle={{ fontWeight: '600' }}
          onPress={handleTestNotification}
        />
        <View style={{ paddingHorizontal: 14, paddingBottom: 10 }}>
          <Text style={noteStyle} selectable>
            If Focus Modes are enabled, notifications might not appear.
          </Text>
        </View>
      </SettingsSection>

      {/* Section 5: Interface (rounded panel) */}
      <View style={{ marginBottom: 8 }}>
        <Text style={[sectionLabelStyle, { marginBottom: 8 }]} selectable>
          INTERFACE.
        </Text>
      </View>
      <SettingsSection>
        <SettingsRow
          label="True Dark Colors"
          right={(
            <Switch
              isSelected={settings.trueDarkColors}
              onSelectedChange={isSelected => update({ trueDarkColors: isSelected })}
            />
          )}
        />
        <SettingsRowDivider />
        <SettingsRow
          label="Haptic Feedback"
          right={(
            <Switch
              isSelected={settings.hapticsEnabled}
              onSelectedChange={isSelected => update({ hapticsEnabled: isSelected })}
            />
          )}
        />
      </SettingsSection>

      {/* Currency rates (rounded panel) */}
      <View style={{ marginBottom: 8 }}>
        <Text style={[sectionLabelStyle, { marginBottom: 8 }]} selectable>
          CURRENCY RATES
        </Text>
      </View>
      <SettingsSection>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.text, fontSize: 14 }} selectable>
              Last update:
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }} selectable>
              {updatedAtLabel}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={refreshFromBundle}
            style={({ pressed }) => [
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                borderCurve: 'continuous',
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }} selectable>
              Update Now
            </Text>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 14, paddingBottom: 10 }}>
          <Text style={noteStyle} selectable>
            Currency rates can be automatically updated via our server. These currency rates are
            approximate and may differ from your local currency rates.
          </Text>
        </View>
      </SettingsSection>

      {/* More: Rate & Review, etc. (rounded panel for consistency) */}
      <SettingsSection>
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="star" />}
          label="Rate & Review"
          accessorySymbol="arrow.up.right"
        />
        <SettingsRowDivider inset={ICON_DIVIDER_INSET} />
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="list.bullet.rectangle" />}
          label="Ideas & Roadmap"
          accessorySymbol="arrow.up.right"
        />
        <SettingsRowDivider inset={ICON_DIVIDER_INSET} />
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="envelope" />}
          label="Contact me"
          accessorySymbol="chevron.right"
        />
        <SettingsRowDivider inset={ICON_DIVIDER_INSET} />
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="globe" />}
          label="Visit Website"
          accessorySymbol="arrow.up.right"
        />
        <SettingsRowDivider inset={ICON_DIVIDER_INSET} />
        <SettingsRow
          leading={<SettingsLeadingIcon symbol="square.and.arrow.up" />}
          label="Share with a friend"
          accessorySymbol="chevron.right"
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
    </ModalSheet>
  );
}
