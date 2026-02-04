import { memo } from 'react';

import type { Subscription } from '@/lib/db/schema';
import { Pressable, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';

export type SubscriptionListItemProps = {
  subscription: Subscription;
  onPress?: () => void;
  subtitle?: string;
  trailing?: string;
};

const SubscriptionListItem = memo(function SubscriptionListItem({
  subscription,
  onPress,
  subtitle,
  trailing,
}: SubscriptionListItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl px-4 py-3"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {subscription.name}
          </Text>
          <Text className="mt-1 text-xs" style={{ color: colors.secondaryText }}>
            {subtitle ?? subscription.scheduleType}
          </Text>
        </View>
        {trailing && (
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>
            {trailing}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

export default SubscriptionListItem;
