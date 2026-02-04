import { formatISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { Subscription } from '@/lib/db/schema';
import { Input, Pressable, ScrollView, Select, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import {
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';
import { useModal } from '@/components/ui/modal';
import AmountKeypad from '@/components/subscriptions/amount-keypad';

const SCHEDULE_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Custom', value: 'custom' },
];

const NOTIFICATION_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Custom', value: 'custom' },
  { label: 'None', value: 'none' },
];

export default function SubscriptionFormScreen() {
  useBootstrap();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; templateId?: string }>();
  const { colors } = useTheme();

  const { subscriptions, add, update } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { templates } = useServiceTemplatesStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const existing = useMemo(
    () => (params.id ? subscriptions.find(sub => sub.id === params.id) : undefined),
    [params.id, subscriptions],
  );
  const template = useMemo(
    () => (params.templateId ? templates.find(item => item.id === params.templateId) : undefined),
    [params.templateId, templates],
  );

  const [name, setName] = useState('');
  const [scheduleType, setScheduleType] = useState<Subscription['scheduleType']>('monthly');
  const [intervalCount, setIntervalCount] = useState('1');
  const [intervalUnit, setIntervalUnit] = useState<'week' | 'month'>('month');
  const [startDate, setStartDate] = useState(formatISO(new Date(), { representation: 'date' }));
  const [amountValue, setAmountValue] = useState('');
  const [currency, setCurrency] = useState(settings.mainCurrency);
  const [categoryId, setCategoryId] = useState('');
  const [listId, setListId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<string | undefined>(undefined);
  const [notificationMode, setNotificationMode] = useState<'default' | 'custom' | 'none'>('default');
  const [notes, setNotes] = useState('');

  const amountSheet = useModal();

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setScheduleType(existing.scheduleType);
      setIntervalCount(String(existing.intervalCount));
      setIntervalUnit(existing.intervalUnit ?? 'month');
      setStartDate(existing.startDate);
      setAmountValue(String(existing.amount));
      setCurrency(existing.currency);
      setCategoryId(existing.categoryId);
      setListId(existing.listId);
      setPaymentMethodId(existing.paymentMethodId);
      setNotificationMode(existing.notificationMode);
      setNotes(existing.notes ?? '');
      return;
    }

    if (template) {
      setName(template.name);
      setScheduleType(template.defaultScheduleType ?? 'monthly');
      setCategoryId(template.defaultCategoryId ?? (categories[0]?.id ?? ''));
    }

    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    if (!listId && lists.length > 0) {
      setListId(lists[0].id);
    }
  }, [existing, template, categories, lists, categoryId, listId]);

  const currencyOptions = useMemo(
    () => Object.keys(rates.rates).map(code => ({ label: code, value: code })),
    [rates.rates],
  );

  const categoryOptions = useMemo(
    () => categories.map(cat => ({ label: cat.name, value: cat.id })),
    [categories],
  );

  const listOptions = useMemo(
    () => lists.map(list => ({ label: list.name, value: list.id })),
    [lists],
  );

  const paymentOptions = useMemo(
    () => methods.map(method => ({ label: method.name, value: method.id })),
    [methods],
  );

  const isValid = name.trim().length > 0 && Number(amountValue) > 0 && Boolean(startDate);

  const handleSave = () => {
    if (!isValid) {
      return;
    }

    const base = {
      name: name.trim(),
      status: existing?.status ?? 'active',
      iconType: existing?.iconType ?? 'builtIn',
      iconKey: existing?.iconKey ?? template?.iconKey ?? 'custom',
      iconUri: existing?.iconUri,
      amount: Number(amountValue),
      currency,
      scheduleType,
      intervalCount: Number(intervalCount) || 1,
      intervalUnit: scheduleType === 'custom' ? intervalUnit : undefined,
      billingAnchor: startDate,
      startDate,
      categoryId: categoryId || categories[0]?.id || 'cat-utilities',
      listId: listId || lists[0]?.id || 'list-personal',
      paymentMethodId,
      notificationMode,
      notes: notes.trim().length ? notes.trim() : undefined,
    };

    if (existing) {
      update({
        ...existing,
        ...base,
        updatedAt: new Date().toISOString(),
      });
    } else {
      add(base as any);
    }

    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Cancel
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {existing ? 'Edit Subscription' : 'New Subscription'}
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 rounded-3xl px-4 py-4" style={{ backgroundColor: colors.card }}>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Service name"
          />
          <Select
            label="Schedule"
            value={scheduleType}
            options={SCHEDULE_OPTIONS}
            onSelect={value => setScheduleType(value as Subscription['scheduleType'])}
          />
          {scheduleType === 'custom' && (
            <View className="flex-row">
              <View className="mr-3 flex-1">
                <Input
                  label="Every"
                  value={intervalCount}
                  keyboardType="number-pad"
                  onChangeText={setIntervalCount}
                />
              </View>
              <View className="flex-1">
                <Select
                  label="Unit"
                  value={intervalUnit}
                  options={[
                    { label: 'Weeks', value: 'week' },
                    { label: 'Months', value: 'month' },
                  ]}
                  onSelect={value => setIntervalUnit(value as 'week' | 'month')}
                />
              </View>
            </View>
          )}
          <Input
            label="Start Date"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View className="mt-4 rounded-3xl px-4 py-4" style={{ backgroundColor: colors.card }}>
          <Pressable onPress={() => amountSheet.present()}>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Amount
            </Text>
            <Text className="mt-2 text-xl font-semibold" style={{ color: colors.text }}>
              {amountValue.length ? amountValue : '0.00'} {currency}
            </Text>
          </Pressable>
          <Select
            label="Currency"
            value={currency}
            options={currencyOptions}
            onSelect={value => setCurrency(String(value))}
          />
        </View>

        <View className="mt-4 rounded-3xl px-4 py-4" style={{ backgroundColor: colors.card }}>
          <Select
            label="Category"
            value={categoryId}
            options={categoryOptions}
            onSelect={value => setCategoryId(String(value))}
          />
          <Select
            label="List"
            value={listId}
            options={listOptions}
            onSelect={value => setListId(String(value))}
          />
          <Select
            label="Payment Method"
            value={paymentMethodId}
            options={paymentOptions}
            onSelect={value => setPaymentMethodId(String(value))}
            placeholder="Select..."
          />
          <Select
            label="Notifications"
            value={notificationMode}
            options={NOTIFICATION_OPTIONS}
            onSelect={value => setNotificationMode(value as 'default' | 'custom' | 'none')}
          />
        </View>

        <View className="mt-4 rounded-3xl px-4 py-4" style={{ backgroundColor: colors.card }}>
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional"
            multiline
            style={{ minHeight: 80 }}
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!isValid}
          className="mt-6 items-center justify-center rounded-2xl py-4"
          style={{ backgroundColor: isValid ? colors.primary : colors.border }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.headerText }}>
            {existing ? 'Save Changes' : 'Add Subscription'}
          </Text>
        </Pressable>
      </ScrollView>

      <AmountKeypad
        modalRef={amountSheet.ref}
        value={amountValue}
        onChange={setAmountValue}
        onDone={() => amountSheet.dismiss()}
        currency={currency}
      />
    </View>
  );
}
