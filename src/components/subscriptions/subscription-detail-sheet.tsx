import type { RefObject } from 'react';
import type { Subscription } from '@/lib/db/schema';

import { format, parseISO } from 'date-fns';
import { Modal, ModalScrollView, Pressable, Select, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useCurrencyRatesStore, useListsStore, usePaymentMethodsStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { calculateTotalSpent } from '@/lib/utils/totals';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Canceled', value: 'canceled' },
];

export type SubscriptionDetailSheetProps = {
  subscription: Subscription | null;
  onEdit?: (subscription: Subscription) => void;
  modalRef: RefObject<any>;
};

export default function SubscriptionDetailSheet({ subscription, onEdit, modalRef }: SubscriptionDetailSheetProps) {
  const { colors } = useTheme();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { setStatus } = useSubscriptionsStore();

  if (!subscription) {
    return (
      <Modal ref={modalRef} snapPoints={['60%']} title="Subscription" />
    );
  }

  const category = categories.find(cat => cat.id === subscription.categoryId);
  const list = lists.find(item => item.id === subscription.listId);
  const method = methods.find(item => item.id === subscription.paymentMethodId);
  const totalSpent = calculateTotalSpent({ subscription, settings, rates });

  return (
    <Modal ref={modalRef} snapPoints={['75%']} title={subscription.name} collapsibleTitle>
      <ModalScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <View className="mt-4 flex-row items-center justify-between">
          <Select
            value={subscription.status}
            options={STATUS_OPTIONS}
            onSelect={value => setStatus(subscription.id, value as Subscription['status'])}
          />
          <Pressable
            onPress={() => onEdit?.(subscription)}
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              Edit
            </Text>
          </Pressable>
        </View>

        <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.card }}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Amount
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {subscription.amount.toFixed(2)}
              {' '}
              {subscription.currency}
            </Text>
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Next payment
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {format(parseISO(subscription.nextPaymentDate), 'd MMM')}
            </Text>
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Total spent
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {totalSpent.toFixed(settings.roundWholeNumbers ? 0 : 2)}
              {' '}
              {settings.mainCurrency}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Notifications
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {subscription.notificationMode === 'default' ? 'Default' : subscription.notificationMode === 'none' ? 'Off' : 'Custom'}
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.card }}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Category
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {category?.name ?? '—'}
            </Text>
          </View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              List
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {list?.name ?? '—'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Payment Method
            </Text>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {method?.name ?? '—'}
            </Text>
          </View>
        </View>

        {subscription.notes && (
          <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.card }}>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Notes
            </Text>
            <Text className="mt-2 text-base" style={{ color: colors.text }}>
              {subscription.notes}
            </Text>
          </View>
        )}
      </ModalScrollView>
    </Modal>
  );
}
