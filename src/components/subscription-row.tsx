import type { Settings, Subscription } from '@/lib/db/schema';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

import { Pill } from '@/components/pill';
import { ServiceIcon } from '@/components/service-icon';
import {
  SUBSCRIPTION_ROW_CHEVRON_SIZE,
  SUBSCRIPTION_ROW_DIVIDER_INSET_LEFT,
  SUBSCRIPTION_ROW_GAP,
  SUBSCRIPTION_ROW_GAP_COMPACT,
  SUBSCRIPTION_ROW_ICON_SIZE,
  SUBSCRIPTION_ROW_ICON_SIZE_COMPACT,
  SUBSCRIPTION_ROW_PADDING_H,
  SUBSCRIPTION_ROW_PADDING_V,
} from '@/lib/constants';
import { useTheme } from '@/lib/hooks/use-theme';
import { formatAmount } from '@/lib/utils/format';

export type SubscriptionRowVariant = 'search' | 'day';

export type SubscriptionRowProps = {
  sub: Subscription;
  settings: Settings;
  variant: SubscriptionRowVariant;
  /** Only used in search variant: show divider below the row. */
  showDivider?: boolean;
};

const DAY_VIEW_PADDING_H = 16;
const DAY_VIEW_PADDING_V = 12;

/**
 * Shared row content for a subscription in list contexts (search results, day view).
 * Renders icon, name, subtitle (schedule + amount), optional status pill, and chevron.
 * Parent is responsible for Link/Pressable/GlassView/GlassCard wrapper.
 */
export function SubscriptionRow({
  sub,
  settings,
  variant,
  showDivider = false,
}: SubscriptionRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const isSearch = variant === 'search';
  const iconSize = isSearch ? SUBSCRIPTION_ROW_ICON_SIZE : SUBSCRIPTION_ROW_ICON_SIZE_COMPACT;
  const gap = isSearch ? SUBSCRIPTION_ROW_GAP : SUBSCRIPTION_ROW_GAP_COMPACT;
  const paddingH = isSearch ? SUBSCRIPTION_ROW_PADDING_H : DAY_VIEW_PADDING_H;
  const paddingV = isSearch ? SUBSCRIPTION_ROW_PADDING_V : DAY_VIEW_PADDING_V;

  const isActive = sub.status === 'active';
  const statusLabel = isActive
    ? t('subscription_status.active')
    : sub.status === 'paused'
      ? t('subscription_status.paused')
      : sub.status === 'canceled'
        ? t('subscription_status.canceled')
        : sub.status;

  const subtitle = `${t(`subscription.${sub.scheduleType}`)} · ${formatAmount(sub.amount, sub.currency, settings.roundWholeNumbers)}`;
  const titleSize = isSearch ? 17 : 16;
  const subtitleSize = isSearch ? 13 : 12;

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          gap,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap, flex: 1, minWidth: 0 }}>
          <ServiceIcon
            iconKey={sub.iconKey}
            iconUri={sub.iconType === 'image' ? sub.iconUri : undefined}
            size={iconSize}
          />
          <View style={{ gap: isSearch ? 4 : 2, flex: 1, minWidth: 0, marginLeft: isSearch ? 0 : 4 }}>
            <Text
              style={{
                fontSize: titleSize,
                fontWeight: '600',
                color: colors.text,
                letterSpacing: isSearch ? -0.2 : undefined,
              }}
              selectable
              numberOfLines={1}
            >
              {sub.name}
            </Text>
            <Text
              style={{ fontSize: subtitleSize, color: colors.textMuted }}
              selectable
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {isSearch && (
            <Pill tone={isActive ? 'success' : 'neutral'}>
              {statusLabel}
            </Pill>
          )}
          <Image
            source={'sf:chevron.right' as any}
            style={{ width: SUBSCRIPTION_ROW_CHEVRON_SIZE, height: SUBSCRIPTION_ROW_CHEVRON_SIZE }}
            tintColor={colors.textMuted}
          />
        </View>
      </View>
      {showDivider && (
        <View
          style={{
            height: 1,
            marginLeft: SUBSCRIPTION_ROW_DIVIDER_INSET_LEFT,
            marginRight: SUBSCRIPTION_ROW_PADDING_H,
            backgroundColor: colors.surfaceBorder,
            opacity: 0.6,
          }}
        />
      )}
    </>
  );
}
