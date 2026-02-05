import type { ReactNode } from 'react';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { Switch, useToast } from 'heroui-native';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormSheet } from '@/components/form-sheet';
import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { Pill } from '@/components/pill';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useCategoriesStore,
  useCurrencyRatesStore,
  usePaymentMethodsStore,
  useSettingsStore,
} from '@/lib/stores';

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '\u{1F1FA}\u{1F1F8}',
  EUR: '\u{1F1EA}\u{1F1FA}',
  GBP: '\u{1F1EC}\u{1F1E7}',
  JPY: '\u{1F1EF}\u{1F1F5}',
  AUD: '\u{1F1E6}\u{1F1FA}',
  CAD: '\u{1F1E8}\u{1F1E6}',
  CHF: '\u{1F1E8}\u{1F1ED}',
};

const formatReminderLabel = (days: number) => {
  if (days === 0) {
    return 'Same Day';
  }
  return `${days} Day${days === 1 ? '' : 's'}`;
};

const formatUpdatedAt = (value: string) => {
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
};

type SettingsRowProps = {
  label: string;
  subtitle?: string;
  leading?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  accessorySymbol?: string;
  labelTone?: 'default' | 'accent';
  style?: ComponentProps<typeof View>['style'];
  labelStyle?: ComponentProps<typeof Text>['style'];
};

function SettingsRow({
  label,
  subtitle,
  leading,
  right,
  onPress,
  accessorySymbol,
  labelTone = 'default',
  style,
  labelStyle,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const Container = onPress ? Pressable : View;
  const labelColor = labelTone === 'accent' ? colors.warning : colors.text;

  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={onPress
        ? ({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 9,
              gap: 12,
            },
            style,
            pressed && { opacity: 0.7 },
          ]
        : [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 9,
              gap: 12,
            },
            style,
          ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {leading}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={[
              {
                color: labelColor,
                fontSize: 16,
                fontWeight: '500',
              },
              labelStyle,
            ]}
            selectable
          >
            {label}
          </Text>
          {subtitle
            ? (
                <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                  {subtitle}
                </Text>
              )
            : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {right}
        {accessorySymbol
          ? (
              <Image
                source={`sf:${accessorySymbol}`}
                style={{ width: 12, height: 12 }}
                tintColor={colors.textMuted}
              />
            )
          : null}
      </View>
    </Container>
  );
}

type RowDividerProps = {
  inset?: number;
};

function RowDivider({ inset = 0 }: RowDividerProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.surfaceBorder,
        opacity: 0.6,
        marginLeft: inset,
      }}
    />
  );
}

type LeadingIconProps = {
  symbol: string;
};

function LeadingIcon({ symbol }: LeadingIconProps) {
  const { colors } = useTheme();

  return (
    <View style={{ width: 24, alignItems: 'center' }}>
      <Image
        source={`sf:${symbol}`}
        style={{ width: 18, height: 18 }}
        tintColor={colors.textMuted}
      />
    </View>
  );
}

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
  useBootstrap();
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
        trigger: { seconds: 1 },
      });
      toast.show('Test notification scheduled');
    } catch {
      toast.show('Unable to schedule a test notification');
    }
  };

  const cardStyle = { borderRadius: 22 };
  const cardBodyStyle = { padding: 12, gap: 0 };
  const sectionLabelStyle = { fontSize: 12, letterSpacing: 1, color: colors.textMuted };
  const noteStyle = { fontSize: 12, color: colors.textMuted, lineHeight: 18 };
  const iconDividerInset = 36;

  return (
    <FormSheet
      title="Settings"
      closeVariant="muted"
      contentContainerStyle={{
        gap: 10,
        padding: 0,
        paddingTop: 6,
        paddingHorizontal: 14,
        paddingBottom: bottom + 20,
      }}
    >
      <GlassCard style={cardStyle}>
        <GlassCardBody style={{ padding: 12, gap: 8 }}>
          <SettingsRow
            leading={<SubscriptionBadge />}
            label="Subscription Day"
            subtitle="Account type"
            labelStyle={{ fontSize: 18, fontWeight: '600' }}
            right={<Pill tone="accent">Free</Pill>}
            accessorySymbol="chevron.right"
          />
          <RowDivider />
          <Text style={{ fontSize: 13, color: colors.textMuted }} selectable>
            In Beta, your purchases aren't charged.
          </Text>
        </GlassCardBody>
      </GlassCard>

      <GlassCard style={cardStyle}>
        <GlassCardBody style={cardBodyStyle}>
          <SettingsRow
            leading={<LeadingIcon symbol="externaldrive" />}
            label="iCloud & Data"
            right={(
              <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
                {settings.iCloudEnabled ? 'On' : 'Off'}
              </Text>
            )}
            accessorySymbol="chevron.right"
            onPress={() => update({ iCloudEnabled: !settings.iCloudEnabled })}
          />
        </GlassCardBody>
      </GlassCard>

      <GlassCard style={cardStyle}>
        <GlassCardBody style={cardBodyStyle}>
          <SettingsRow
            label="Main Currency"
            onPress={() => router.push('/(modals)/currency')}
            right={(
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {currencyFlag
                  ? (
                      <Text style={{ fontSize: 16 }} selectable>
                        {currencyFlag}
                      </Text>
                    )
                  : null}
                <Text
                  style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }}
                  selectable
                >
                  {settings.mainCurrency}
                </Text>
              </View>
            )}
            accessorySymbol="chevron.right"
          />
          <RowDivider />
          <SettingsRow
            label="Round to Whole Numbers"
            right={(
              <Switch
                isSelected={settings.roundWholeNumbers}
                onSelectedChange={isSelected => update({ roundWholeNumbers: isSelected })}
              />
            )}
          />
        </GlassCardBody>
      </GlassCard>

      <GlassCard style={cardStyle}>
        <GlassCardBody style={cardBodyStyle}>
          <SettingsRow
            leading={<LeadingIcon symbol="square.grid.2x2" />}
            label="Categories"
            onPress={() => router.push('/(modals)/categories')}
            right={(
              <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
                {categories.length}
              </Text>
            )}
            accessorySymbol="chevron.right"
          />
          <RowDivider inset={iconDividerInset} />
          <SettingsRow
            leading={<LeadingIcon symbol="creditcard" />}
            label="Payment Methods"
            onPress={() => router.push('/(modals)/payment-methods')}
            right={(
              <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }} selectable>
                {methods.length}
              </Text>
            )}
            accessorySymbol="chevron.right"
          />
        </GlassCardBody>
      </GlassCard>

      <View style={{ gap: 6 }}>
        <Text style={sectionLabelStyle} selectable>
          NOTIFICATIONS
        </Text>
        <GlassCard style={cardStyle}>
          <GlassCardBody style={cardBodyStyle}>
            <SettingsRow
              label="First Reminder"
              onPress={() => router.push('/(modals)/notification-settings')}
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
            <RowDivider />
            <SettingsRow
              label="Second Reminder"
              onPress={() => router.push('/(modals)/notification-settings')}
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
            <RowDivider />
            <SettingsRow
              label="Test Notification"
              labelTone="accent"
              labelStyle={{ fontWeight: '600' }}
              onPress={handleTestNotification}
            />
          </GlassCardBody>
        </GlassCard>
        <Text style={noteStyle} selectable>
          If Focus Modes are enabled, notifications might not appear.
        </Text>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={sectionLabelStyle} selectable>
          INTERFACE
        </Text>
        <GlassCard style={cardStyle}>
          <GlassCardBody style={cardBodyStyle}>
            <SettingsRow
              label="True Dark Colors"
              right={(
                <Switch
                  isSelected={settings.trueDarkColors}
                  onSelectedChange={isSelected => update({ trueDarkColors: isSelected })}
                />
              )}
            />
            <RowDivider />
            <SettingsRow
              label="Haptic Feedback"
              right={(
                <Switch
                  isSelected={settings.hapticsEnabled}
                  onSelectedChange={isSelected => update({ hapticsEnabled: isSelected })}
                />
              )}
            />
          </GlassCardBody>
        </GlassCard>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={sectionLabelStyle} selectable>
          CURRENCY RATES
        </Text>
        <GlassCard style={cardStyle}>
          <GlassCardBody style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
          </GlassCardBody>
        </GlassCard>
        <Text style={noteStyle} selectable>
          Currency rates can be automatically updated via our server. These currency rates are
          approximate and may differ from your local currency rates.
        </Text>
      </View>

      <GlassCard style={cardStyle}>
        <GlassCardBody style={cardBodyStyle}>
          <SettingsRow
            leading={<LeadingIcon symbol="star" />}
            label="Rate & Review"
            accessorySymbol="arrow.up.right"
          />
          <RowDivider inset={iconDividerInset} />
          <SettingsRow
            leading={<LeadingIcon symbol="list.bullet.rectangle" />}
            label="Ideas & Roadmap"
            accessorySymbol="arrow.up.right"
          />
          <RowDivider inset={iconDividerInset} />
          <SettingsRow
            leading={<LeadingIcon symbol="envelope" />}
            label="Contact me"
            accessorySymbol="chevron.right"
          />
          <RowDivider inset={iconDividerInset} />
          <SettingsRow
            leading={<LeadingIcon symbol="globe" />}
            label="Visit Website"
            accessorySymbol="arrow.up.right"
          />
          <RowDivider inset={iconDividerInset} />
          <SettingsRow
            leading={<LeadingIcon symbol="square.and.arrow.up" />}
            label="Share with a friend"
            accessorySymbol="chevron.right"
          />
        </GlassCardBody>
      </GlassCard>

      <View style={{ alignItems: 'center', gap: 6, paddingTop: 0 }}>
        <Image
          source="sf:heart.fill"
          style={{ width: 18, height: 18 }}
          tintColor="#FF4D4F"
        />
        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }} selectable>
          Made with love for details at Appps\u2122 \u00A9 2026
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }} selectable>
          Version: 1.0
        </Text>
      </View>
    </FormSheet>
  );
}
