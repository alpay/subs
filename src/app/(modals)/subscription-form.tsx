import type { NotificationMode, ScheduleType, Subscription, SubscriptionStatus } from '@/lib/db/schema';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Input, Label, Select, TextArea, TextField, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalHeader } from '@/components/modal-header';
import { Pill } from '@/components/pill';
import { ScreenShell } from '@/components/screen-shell';
import { SelectField } from '@/components/select-field';
import { ServiceIcon } from '@/components/service-icon';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
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
import { formatAmount } from '@/lib/utils/format';

type FormState = {
  name: string;
  amount: string;
  currency: string;
  scheduleType: ScheduleType;
  intervalCount: string;
  intervalUnit: 'week' | 'month';
  startDate: string;
  categoryId: string;
  listId: string;
  paymentMethodId: string;
  status: SubscriptionStatus;
  notificationMode: NotificationMode;
  iconType: 'builtIn' | 'image';
  iconKey: string;
  iconUri: string;
  notes: string;
};

const SCHEDULE_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Custom', value: 'custom' },
] as const;

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Canceled', value: 'canceled' },
] as const;

const NOTIFICATION_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Custom', value: 'custom' },
  { label: 'None', value: 'none' },
] as const;

const INTERVAL_UNIT_OPTIONS = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
] as const;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

export default function SubscriptionFormScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string; templateId?: string }>();

  const { subscriptions, add, update } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { templates } = useServiceTemplatesStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const existingSubscription = useMemo(
    () => (params.id ? subscriptions.find(subscription => subscription.id === params.id) : undefined),
    [params.id, subscriptions],
  );

  const selectedTemplate = useMemo(
    () => (params.templateId ? templates.find(template => template.id === params.templateId) : undefined),
    [params.templateId, templates],
  );

  const formSeed = useMemo<FormState>(() => {
    if (existingSubscription) {
      return {
        name: existingSubscription.name,
        amount: String(existingSubscription.amount),
        currency: existingSubscription.currency,
        scheduleType: existingSubscription.scheduleType,
        intervalCount: String(existingSubscription.intervalCount || 1),
        intervalUnit: existingSubscription.intervalUnit ?? 'month',
        startDate: existingSubscription.startDate,
        categoryId: existingSubscription.categoryId,
        listId: existingSubscription.listId,
        paymentMethodId: existingSubscription.paymentMethodId ?? '',
        status: existingSubscription.status,
        notificationMode: existingSubscription.notificationMode,
        iconType: existingSubscription.iconType,
        iconKey: existingSubscription.iconKey ?? 'custom',
        iconUri: existingSubscription.iconUri ?? '',
        notes: existingSubscription.notes ?? '',
      };
    }

    return {
      name: selectedTemplate?.name ?? '',
      amount: '',
      currency: settings.mainCurrency,
      scheduleType: selectedTemplate?.defaultScheduleType ?? 'monthly',
      intervalCount: '1',
      intervalUnit: 'month',
      startDate: todayIsoDate(),
      categoryId: selectedTemplate?.defaultCategoryId ?? categories[0]?.id ?? '',
      listId: lists[0]?.id ?? '',
      paymentMethodId: '',
      status: 'active',
      notificationMode: 'default',
      iconType: 'builtIn',
      iconKey: selectedTemplate?.iconKey ?? 'custom',
      iconUri: '',
      notes: '',
    };
  }, [existingSubscription, selectedTemplate, settings.mainCurrency, categories, lists]);

  const [name, setName] = useState(formSeed.name);
  const [amount, setAmount] = useState(formSeed.amount);
  const [currency, setCurrency] = useState(formSeed.currency);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(formSeed.scheduleType);
  const [intervalCount, setIntervalCount] = useState(formSeed.intervalCount);
  const [intervalUnit, setIntervalUnit] = useState<'week' | 'month'>(formSeed.intervalUnit);
  const [startDate, setStartDate] = useState(formSeed.startDate);
  const [categoryId, setCategoryId] = useState(formSeed.categoryId);
  const [listId, setListId] = useState(formSeed.listId);
  const [paymentMethodId, setPaymentMethodId] = useState(formSeed.paymentMethodId);
  const [status, setStatus] = useState<SubscriptionStatus>(formSeed.status);
  const [notificationMode, setNotificationMode] = useState<NotificationMode>(formSeed.notificationMode);
  const [iconType, setIconType] = useState<'builtIn' | 'image'>(formSeed.iconType);
  const [iconKey, setIconKey] = useState(formSeed.iconKey);
  const [iconUri, setIconUri] = useState(formSeed.iconUri);
  const [notes, setNotes] = useState(formSeed.notes);

  const currencyOptions = useMemo(
    () => Object.keys(rates.rates).sort().map(code => ({ label: code, value: code })),
    [rates.rates],
  );

  const categoryOptions = useMemo(
    () => categories.map(category => ({ label: category.name, value: category.id })),
    [categories],
  );

  const listOptions = useMemo(
    () => lists.map(list => ({ label: list.name, value: list.id })),
    [lists],
  );

  const paymentMethodOptions = useMemo(
    () => [
      { label: 'None', value: '' },
      ...methods.map(method => ({ label: method.name, value: method.id })),
    ],
    [methods],
  );

  const amountValue = Number(amount);
  const isValid = name.trim().length > 0 && Number.isFinite(amountValue) && amountValue > 0;

  const handleSave = () => {
    if (!isValid) {
      toast.show('Please fill name and amount before saving');
      return;
    }

    const normalizedDate = isValidDateString(startDate) ? startDate : todayIsoDate();
    const normalizedSchedule = scheduleType;
    const normalizedIntervalCount = normalizedSchedule === 'custom'
      ? Math.max(1, Number(intervalCount) || 1)
      : 1;

    const payload: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'nextPaymentDate'> = {
      name: name.trim(),
      status,
      iconType,
      iconKey: iconKey.trim() || 'custom',
      iconUri: iconType === 'image' && iconUri.trim() ? iconUri.trim() : undefined,
      amount: amountValue,
      currency,
      scheduleType: normalizedSchedule,
      intervalCount: normalizedIntervalCount,
      intervalUnit: normalizedSchedule === 'custom' ? intervalUnit : undefined,
      billingAnchor: normalizedDate,
      startDate: normalizedDate,
      categoryId: categoryId || categoryOptions[0]?.value || '',
      listId: listId || listOptions[0]?.value || '',
      paymentMethodId: paymentMethodId || undefined,
      notificationMode,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    if (existingSubscription) {
      update({
        ...existingSubscription,
        ...payload,
      });
      toast.show('Subscription updated');
    }
    else {
      add(payload);
      toast.show('Subscription created');
    }

    router.back();
  };

  const amountDisplay = Number.isFinite(amountValue)
    ? formatAmount(amountValue, currency, settings.roundWholeNumbers)
    : `0 ${currency}`;

  return (
    <>
      <ModalHeader title={existingSubscription ? 'Edit Subscription' : 'New Subscription'} />
      <ScreenShell>
        <GlassCard>
          <GlassCardBody style={{ alignItems: 'center', gap: 12 }}>
            <ServiceIcon iconKey={iconKey} size={72} />
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }} selectable>
                {name.trim() || 'Subscription'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                {scheduleType.toUpperCase()}
              </Text>
            </View>
            <Pill tone={status === 'active' ? 'success' : 'neutral'}>{status}</Pill>
            <Text
              style={{ fontSize: 22, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {amountDisplay}
            </Text>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 12 }}>
            <TextField>
              <Label>Name</Label>
              <Input value={name} onChangeText={setName} placeholder="Subscription name" />
            </TextField>

            <TextField>
              <Label>Amount</Label>
              <Input
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={{ textAlign: 'center', fontSize: 20 }}
              />
            </TextField>

            <SelectField
              label="Currency"
              value={currency}
              options={currencyOptions}
              placeholder="Select currency"
              onChange={setCurrency}
            />

            <SelectField
              label="Schedule"
              value={scheduleType}
              options={[...SCHEDULE_OPTIONS]}
              placeholder="Select schedule"
              onChange={value => setScheduleType((value as ScheduleType | undefined) ?? 'monthly')}
            />

            {scheduleType === 'custom' && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextField>
                    <Label>Interval count</Label>
                    <Input
                      value={intervalCount}
                      onChangeText={setIntervalCount}
                      keyboardType="number-pad"
                    />
                  </TextField>
                </View>
                <View style={{ flex: 1 }}>
                  <SelectField
                    label="Interval unit"
                    value={intervalUnit}
                    options={[...INTERVAL_UNIT_OPTIONS]}
                    placeholder="Select unit"
                    onChange={value => setIntervalUnit((value as 'week' | 'month' | undefined) ?? 'month')}
                  />
                </View>
              </View>
            )}

            <TextField>
              <Label>Start date</Label>
              <Input value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
            </TextField>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 12 }}>
            <SelectField
              label="Category"
              value={categoryId}
              options={categoryOptions}
              placeholder="Select category"
              onChange={setCategoryId}
            />

            <SelectField
              label="List"
              value={listId}
              options={listOptions}
              placeholder="Select list"
              onChange={setListId}
            />

            <SelectField
              label="Payment method"
              value={paymentMethodId}
              options={paymentMethodOptions}
              placeholder="Select payment method"
              onChange={setPaymentMethodId}
            />

            <SelectField
              label="Status"
              value={status}
              options={[...STATUS_OPTIONS]}
              placeholder="Select status"
              onChange={value => setStatus((value as SubscriptionStatus | undefined) ?? 'active')}
            />

            <SelectField
              label="Notifications"
              value={notificationMode}
              options={[...NOTIFICATION_OPTIONS]}
              placeholder="Select notification mode"
              onChange={value => setNotificationMode((value as NotificationMode | undefined) ?? 'default')}
            />
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 12 }}>
            <TextField>
              <Label>Icon type</Label>
              <Select
                value={{ label: iconType === 'builtIn' ? 'Built-in' : 'Image URI', value: iconType }}
                onValueChange={option => setIconType((option?.value as 'builtIn' | 'image' | undefined) ?? 'builtIn')}
                presentation="bottom-sheet"
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select icon type" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay />
                  <Select.Content presentation="bottom-sheet">
                    <Select.Item value="builtIn" label="Built-in" />
                    <Select.Item value="image" label="Image URI" />
                  </Select.Content>
                </Select.Portal>
              </Select>
            </TextField>

            {iconType === 'builtIn'
              ? (
                  <TextField>
                    <Label>Icon key</Label>
                    <Input value={iconKey} onChangeText={setIconKey} placeholder="custom" />
                  </TextField>
                )
              : (
                  <TextField>
                    <Label>Image URI</Label>
                    <Input
                      value={iconUri}
                      onChangeText={setIconUri}
                      placeholder="https://..."
                      autoCapitalize="none"
                    />
                  </TextField>
                )}

            <Button variant="secondary" onPress={() => router.push('/(modals)/icon-picker')}>
              Open icon picker helper
            </Button>

            <TextField>
              <Label>Notes</Label>
              <TextArea value={notes} onChangeText={setNotes} placeholder="Optional notes" numberOfLines={4} />
            </TextField>
          </GlassCardBody>
        </GlassCard>

        <Button variant="primary" onPress={handleSave}>
          {existingSubscription ? 'Save changes' : 'Create subscription'}
        </Button>
      </ScreenShell>
    </>
  );
}
