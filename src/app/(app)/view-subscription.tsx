import type { Subscription } from '@/lib/db/schema';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { ServiceIcon, getServiceColor } from '@/components/service-icon';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useCategoriesStore,
  useListsStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';
import { countPaymentsUpTo } from '@/lib/utils/subscription-dates';
import { formatAmount, formatNextPayment } from '@/lib/utils/format';
import { parseISO } from 'date-fns';

/** Darken hex color (e.g. for card base or gradient end). */
function darkenHex(hex: string, factor: number): string {
  const n = hex.replace('#', '');
  const r = Math.max(0, Math.floor(parseInt(n.slice(0, 2), 16) * (1 - factor)));
  const g = Math.max(0, Math.floor(parseInt(n.slice(2, 4), 16) * (1 - factor)));
  const b = Math.max(0, Math.floor(parseInt(n.slice(4, 6), 16) * (1 - factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

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

export default function ViewSubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();

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
    if (!subscription) return 0;
    const count = countPaymentsUpTo(subscription);
    return count * subscription.amount;
  }, [subscription]);

  const nextPaymentLabel = useMemo(() => {
    if (!subscription?.nextPaymentDate) return '—';
    return formatNextPayment(parseISO(subscription.nextPaymentDate));
  }, [subscription?.nextPaymentDate]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (!subscription) {
    router.back();
    return null;
  }

  const logoColor = getServiceColor(subscription.iconKey);
  const darkCardColor = darkenHex(logoColor, 0.45);
  const scheduleLabel = subscription.scheduleType.charAt(0).toUpperCase() + subscription.scheduleType.slice(1);

  const detailsBg = isDark ? 'rgba(28, 28, 30, 0.92)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <ModalSheet
      title=""
      closeIconOnly
      isVisible={true}
      onClose={handleClose}
      enableDynamicSizing
      contentContainerStyle={{ padding: 0, gap: 0 }}
      bottomScrollSpacer={32}
    >
      {/* Main subscription card: particle/glow background across whole card */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 16,
          borderRadius: 24,
          borderCurve: 'continuous',
          overflow: 'hidden',
          minHeight: 220,
        }}
      >
        {/* Base dark color */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: darkCardColor,
          }}
        />
        {/* Logo color as particle/glow background across upper ~2/3 of card */}
        <LinearGradient
          colors={[logoColor, logoColor, darkCardColor]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                }}
              />
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }} selectable>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Text>
              </View>
              <Image
                source="sf:chevron.down"
                style={{ width: 12, height: 12 }}
                tintColor="rgba(255,255,255,0.8)"
              />
            </View>
            <Pressable
              onPress={() => {
                router.back();
                setTimeout(() => {
                  router.push({ pathname: '/(app)/subscription-form', params: { id: subscription.id } });
                }, 300);
              }}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                },
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }} selectable>
                Edit
              </Text>
            </Pressable>
          </View>

          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ marginBottom: 12 }}>
              <ServiceIcon
                iconKey={subscription.iconKey}
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
                color: '#FFFFFF',
              }}
              selectable
            >
              {subscription.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 4,
              }}
              selectable
            >
              {scheduleLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Details section: translucent overlay so green shows through */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          borderRadius: 20,
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: detailsBg,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        }}
      >
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
      </View>

      {/* Category row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: 20,
          marginBottom: 12,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 16,
          borderCurve: 'continuous',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        }}
      >
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

      {/* List row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: 20,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 16,
          borderCurve: 'continuous',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        }}
      >
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
    </ModalSheet>
  );
}
