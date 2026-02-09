import type { Subscription } from '@/lib/db/schema';

import { parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RadialGlow } from '@/components/radial-glow';
import { ServiceIcon } from '@/components/service-icon';
import { GlassCard } from '@/components/ui/glass-card';
import { useSubscriptionGlowColor, useTheme } from '@/lib/hooks';
import {
  useCategoriesStore,
  useListsStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';
import { formatAmount, formatNextPayment } from '@/lib/utils/format';
import { countPaymentsUpTo } from '@/lib/utils/subscription-dates';

const NOTIFICATION_LABELS: Record<Subscription['notificationMode'], string> = {
  default: 'Default',
  custom: 'Custom',
  none: 'None',
};

function DetailRow({
  label,
  value,
  showArrow,
}: { label: string; value: string; showArrow?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 18,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 15, color: colors.textMuted }} selectable>
          {label}
        </Text>
        {showArrow && (
          <Image
            source="sf:arrow.up"
            style={{ width: 12, height: 12 }}
            tintColor={colors.textMuted}
          />
        )}
      </View>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
        {value}
      </Text>
    </View>
  );
}

export default function SubscriptionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { subscriptions } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { settings } = useSettingsStore();

  const subscription = useMemo(
    () => subscriptions.find(s => s.id === params.id),
    [subscriptions, params.id],
  );

  const categoryName = useMemo(
    () => categories.find(c => c.id === subscription?.categoryId)?.name ?? 'Other',
    [categories, subscription?.categoryId],
  );

  const listName = useMemo(
    () => lists.find(l => l.id === subscription?.listId)?.name ?? '—',
    [lists, subscription?.listId],
  );

  const totalSpent = useMemo(() => {
    if (!subscription)
      return 0;
    const count = countPaymentsUpTo(subscription);
    return count * subscription.amount;
  }, [subscription]);

  const nextPaymentLabel = useMemo(() => {
    if (!subscription?.nextPaymentDate)
      return '—';
    return formatNextPayment(parseISO(subscription.nextPaymentDate));
  }, [subscription]);

  if (!subscription) {
    router.back();
    return null;
  }

  const logoColor = useSubscriptionGlowColor(subscription);
  const scheduleLabel = subscription.scheduleType.charAt(0).toUpperCase() + subscription.scheduleType.slice(1);

  const handleEdit = () => {
    router.push({ pathname: '/(app)/subscription/edit/[id]', params: { id: subscription.id } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen.BackButton displayMode="minimal" />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={handleEdit}>
          Edit
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Smooth radial glow centered behind logo (like sun rays) */}
        <RadialGlow color={logoColor} centerY="25%" maxOpacity={0.75} />
        <ScrollView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: insets.bottom + 32,
          }}
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* Subscription hero: logo only; glow is the whole screen (header + scroll) */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              minHeight: 200,
              paddingTop: 28,
              paddingBottom: 28,
              paddingHorizontal: 20,
            }}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ marginBottom: 12 }}>
                <ServiceIcon
                  iconKey={subscription.iconKey}
                  iconUri={subscription.iconType === 'image' ? subscription.iconUri : undefined}
                  size={88}
                  style={{
                    borderWidth: 0,
                    borderColor: 'transparent',
                    boxShadow: 'none',
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.text,
                }}
                selectable
              >
                {subscription.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  marginTop: 4,
                }}
                selectable
              >
                {scheduleLabel}
              </Text>
            </View>
          </View>

          {/* Details section – same glass card as Category/List */}
          <GlassCard style={{ marginHorizontal: 20, marginBottom: 12 }}>
            <DetailRow
              label="Amount"
              value={formatAmount(subscription.amount, subscription.currency, settings.roundWholeNumbers)}
              showArrow
            />
            <View style={{ height: 1, marginLeft: 18, marginRight: 18, backgroundColor: colors.surfaceBorder, opacity: 0.7 }} />
            <DetailRow label="Next payment" value={nextPaymentLabel} />
            <View style={{ height: 1, marginLeft: 18, marginRight: 18, backgroundColor: colors.surfaceBorder, opacity: 0.7 }} />
            <DetailRow
              label="Total spent"
              value={formatAmount(totalSpent, subscription.currency, settings.roundWholeNumbers)}
            />
            <View style={{ height: 1, marginLeft: 18, marginRight: 18, backgroundColor: colors.surfaceBorder, opacity: 0.7 }} />
            <DetailRow label="Notifications" value={NOTIFICATION_LABELS[subscription.notificationMode]} />
          </GlassCard>

          {/* Category row */}
          <GlassCard style={{ marginHorizontal: 20, marginBottom: 12 }}>
            <View style={styles.rowInner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source="sf:tag" style={{ width: 18, height: 18 }} tintColor={colors.textMuted} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
                  Category
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.surfaceMuted }} />
                <Text style={{ fontSize: 15, color: colors.text }} selectable>
                  {categoryName}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* List row */}
          <GlassCard style={{ marginHorizontal: 20 }}>
            <View style={styles.rowInner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source="sf:list.bullet" style={{ width: 18, height: 18 }} tintColor={colors.textMuted} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
                  List
                </Text>
              </View>
              <Text style={{ fontSize: 15, color: colors.text }} selectable>
                {listName}
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
});
