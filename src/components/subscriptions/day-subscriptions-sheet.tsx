import type { RefObject } from 'react';
import type { Subscription } from '@/lib/db/schema';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';

import { useMemo } from 'react';
import { Modal, ModalScrollView, Pressable, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCurrencyRatesStore, useSettingsStore } from '@/lib/stores';
import { convertCurrency, roundCurrency } from '@/lib/utils/currency';
import SubscriptionListItem from './subscription-list-item';

export type DaySubscriptionsSheetProps = {
  date: Date;
  subscriptions: Subscription[];
  onAdd?: () => void;
  onSelect?: (subscription: Subscription) => void;
  modalRef: RefObject<any>;
};

export default function DaySubscriptionsSheet({
  date,
  subscriptions,
  onAdd,
  onSelect,
  modalRef,
}: DaySubscriptionsSheetProps) {
  const { colors } = useTheme();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const total = useMemo(() => {
    const sum = subscriptions.reduce((acc, sub) => {
      const converted = convertCurrency({
        amount: sub.amount,
        from: sub.currency,
        to: settings.mainCurrency,
        rates,
      });
      return acc + converted;
    }, 0);
    return roundCurrency(sum, settings.roundWholeNumbers);
  }, [subscriptions, settings, rates]);

  const title = format(date, 'd MMMM yyyy');

  return (
    <Modal
      ref={modalRef}
      snapPoints={['90%']}
      title="Subscriptions"
      collapsibleTitle
    >
      <ModalScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text className="mb-4 text-sm" style={{ color: colors.secondaryText }}>
          {title}
        </Text>

        <FlashList
          data={subscriptions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SubscriptionListItem
              subscription={item}
              subtitle={`${item.scheduleType} · ${item.amount.toFixed(2)} ${item.currency}`}
              trailing={undefined}
              onPress={() => onSelect?.(item)}
            />
          )}
        />

        <Pressable
          onPress={onAdd}
          className="mt-2 flex-row items-center justify-center rounded-2xl p-4"
          style={{ backgroundColor: colors.card }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            + Add Subscription
          </Text>
        </Pressable>

        <View className="mt-4 flex-row items-center justify-between rounded-2xl p-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-sm" style={{ color: colors.secondaryText }}>
            Total
          </Text>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {total.toFixed(settings.roundWholeNumbers ? 0 : 2)}
            {' '}
            {settings.mainCurrency}
          </Text>
        </View>
      </ModalScrollView>
    </Modal>
  );
}
