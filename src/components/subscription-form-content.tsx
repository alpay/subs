import type { MutableRefObject } from 'react';

import type { NotificationMode, ScheduleType, Subscription, SubscriptionStatus } from '@/lib/db/schema';
import { parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Input, TextArea } from 'heroui-native';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SelectPill } from '@/components/select-pill';
import { ServiceIcon } from '@/components/service-icon';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useAddSubscriptionDraftStore,
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useSettingsStore,
} from '@/lib/stores';
import { getCurrencySymbol } from '@/lib/utils/format';

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

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toIsoLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

export type SubscriptionFormInitialState = {
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
  iconKey: string;
  /** Logo image URL (e.g. from Brandfetch); when set, iconType is saved as 'image'. */
  iconUri?: string;
  notes: string;
};

export type SubscriptionFormPayload = Omit<
  Subscription,
  'id' | 'createdAt' | 'updatedAt' | 'nextPaymentDate'
>;

type SubscriptionFormContentProps = {
  isEdit: boolean;
  initialState: SubscriptionFormInitialState;
  onSave: (payload: SubscriptionFormPayload) => void;
  /** Optional ref to call submit from parent (e.g. toolbar). */
  submitRef?: MutableRefObject<(() => void) | null>;
  /** Called when validation state changes (e.g. to disable/enable toolbar button). */
  onValidationChange?: (isValid: boolean) => void;
};

export function SubscriptionFormContent({
  isEdit,
  initialState,
  onSave,
  submitRef,
  onValidationChange,
}: SubscriptionFormContentProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();
  const draftStore = useAddSubscriptionDraftStore();

  const [name, setName] = useState(initialState.name);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(initialState.scheduleType);
  const [intervalCount, setIntervalCount] = useState(initialState.intervalCount);
  const [intervalUnit, setIntervalUnit] = useState<'week' | 'month'>(initialState.intervalUnit);
  const [startDate, setStartDate] = useState(initialState.startDate);
  const [categoryId, setCategoryId] = useState(initialState.categoryId);
  const [listId, setListId] = useState(initialState.listId);
  const [paymentMethodId, setPaymentMethodId] = useState(initialState.paymentMethodId);
  const [status, setStatus] = useState<SubscriptionStatus>(initialState.status);
  const [notificationMode, setNotificationMode] = useState<NotificationMode>(initialState.notificationMode);
  const [iconKey, setIconKey] = useState(initialState.iconKey);
  const [iconUri, setIconUri] = useState(initialState.iconUri ?? '');
  const [notes, setNotes] = useState(initialState.notes);

  const currencyOptions = useMemo(
    () => Object.keys(rates.rates).sort().map(code => ({ label: code, value: code })),
    [rates.rates],
  );
  const categoryOptions = useMemo(
    () => categories.map(c => ({ label: c.name, value: c.id, color: c.color })),
    [categories],
  );
  const listOptions = useMemo(
    () => lists.map(l => ({ label: l.name, value: l.id })),
    [lists],
  );
  const paymentMethodOptions = useMemo(
    () => [{ label: 'None', value: '' }, ...methods.map(m => ({ label: m.name, value: m.id }))],
    [methods],
  );

  const scheduleOption = useMemo(
    () => SCHEDULE_OPTIONS.find(o => o.value === scheduleType),
    [scheduleType],
  );
  const notificationOption = useMemo(
    () => NOTIFICATION_OPTIONS.find(o => o.value === notificationMode),
    [notificationMode],
  );
  const statusOption = useMemo(
    () => STATUS_OPTIONS.find(o => o.value === status),
    [status],
  );
  const selectedCategory = useMemo(
    () => categories.find(c => c.id === categoryId) ?? categories[0],
    [categories, categoryId],
  );

  useEffect(() => {
    // Seed draft store for both create and edit flows so amount picker route works consistently.
    draftStore.reset({
      amount: initialState.amount || '0',
      currency: initialState.currency || settings.mainCurrency || 'USD',
      startDate: isValidDateString(initialState.startDate)
        ? new Date(initialState.startDate)
        : new Date(),
    });
  }, []);

  const draftAmount = draftStore.amount;
  const draftCurrency = draftStore.currency;
  const draftStartDate = draftStore.startDate;
  const amountValue = Number(draftAmount);
  const formattedAmount = Number.isFinite(amountValue) ? amountValue.toFixed(2) : '0.00';
  const isValid = name.trim().length > 0 && Number.isFinite(amountValue) && amountValue > 0;

  const handleAmountPress = useCallback(() => {
    router.push('/(app)/amount-picker');
  }, [router]);

  const handleDatePress = useCallback(() => {
    if (isEdit && isValidDateString(startDate)) {
      draftStore.setStartDate(parseISO(startDate));
    }
    router.push('/(app)/date-picker');
  }, [isEdit, startDate, draftStore, router]);

  const handleSave = useCallback(() => {
    if (!isValid)
      return;

    const finalAmount = Number(draftStore.amount);
    const finalCurrency = draftStore.currency;
    const finalStartDate = toIsoLocalDate(draftStore.startDate);
    const normalizedIntervalCount
      = scheduleType === 'custom' ? Math.max(1, Number(intervalCount) || 1) : 1;

    const useImageIcon = Boolean(iconUri?.trim());
    const payload: SubscriptionFormPayload = {
      name: name.trim(),
      status,
      iconType: useImageIcon ? 'image' : 'builtIn',
      iconKey: useImageIcon ? undefined : (iconKey.trim() || 'custom'),
      iconUri: useImageIcon ? iconUri.trim() : undefined,
      amount: finalAmount,
      currency: finalCurrency,
      scheduleType,
      intervalCount: normalizedIntervalCount,
      intervalUnit: scheduleType === 'custom' ? intervalUnit : undefined,
      billingAnchor: finalStartDate,
      startDate: finalStartDate,
      categoryId: categoryId || (categoryOptions[0]?.value ?? ''),
      listId: listId || (listOptions[0]?.value ?? ''),
      paymentMethodId: paymentMethodId || undefined,
      notificationMode,
      notes: notes.trim() || undefined,
    };

    onSave(payload);
    if (!isEdit) {
      draftStore.reset({
        amount: '0',
        currency: settings.mainCurrency || 'USD',
        startDate: new Date(),
      });
    }
  }, [
    isValid,
    isEdit,
    amountValue,
    draftStore,
    startDate,
    name,
    status,
    iconKey,
    iconUri,
    scheduleType,
    intervalCount,
    intervalUnit,
    categoryId,
    listId,
    paymentMethodId,
    notificationMode,
    notes,
    onSave,
    categoryOptions,
    listOptions,
    settings.mainCurrency,
  ]);

  useEffect(() => {
    if (submitRef)
      submitRef.current = handleSave;
    return () => {
      if (submitRef)
        submitRef.current = null;
    };
  }, [handleSave, submitRef]);

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
    width: '100%' as const,
  };

  const rowDivider = {
    height: 1,
    marginLeft: 18,
    marginRight: 18,
    backgroundColor: colors.surfaceBorder,
    opacity: 0.7,
  };

  const inputStyle = {
    backgroundColor: 'transparent' as const,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: 'right' as const,
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    minHeight: 0,
  };

  return (
    <Fragment>
      <View style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 24 }}>
        <ServiceIcon iconKey={iconKey} iconUri={iconUri || undefined} size={72} />
      </View>

      <GlassCard style={{ marginBottom: 12 }}>
        <View style={rowStyle}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
            Name
          </Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Cursor"
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
            />
          </View>
        </View>
        <View style={rowDivider} />
        <View style={rowStyle}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
            Schedule
          </Text>
          <SelectPill
            value={scheduleOption}
            options={[...SCHEDULE_OPTIONS]}
            onValueChange={o => setScheduleType((o?.value as ScheduleType) ?? 'monthly')}
            size="sm"
          />
        </View>
        {scheduleType === 'custom' && (
          <>
            <View style={rowDivider} />
            <View style={rowStyle}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
                Interval
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Input
                  value={intervalCount}
                  onChangeText={setIntervalCount}
                  keyboardType="number-pad"
                  style={{
                    width: 48,
                    textAlign: 'center',
                    fontSize: 14,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.surfaceBorder,
                  }}
                />
                <SelectPill
                  value={INTERVAL_UNIT_OPTIONS.find(o => o.value === intervalUnit)}
                  options={[...INTERVAL_UNIT_OPTIONS]}
                  onValueChange={o => setIntervalUnit((o?.value as 'week' | 'month') ?? 'month')}
                  size="sm"
                />
              </View>
            </View>
          </>
        )}
        <View style={rowDivider} />
        <Pressable onPress={handleDatePress} style={rowStyle}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
            Start Date
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              borderCurve: 'continuous',
              backgroundColor: colors.surfaceMuted,
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
            }}
          >
            <Text
              style={{ fontSize: 12, color: colors.text, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {formatDateLabel(draftStartDate)}
            </Text>
          </View>
        </Pressable>
      </GlassCard>

      <GlassCard style={{ marginBottom: 12 }}>
        <Pressable
          onPress={handleAmountPress}
          hitSlop={8}
          accessibilityRole="button"
          style={rowStyle}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
            Amount
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{ fontSize: 15, color: colors.textMuted, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {getCurrencySymbol(draftCurrency)}
              {' '}
              {formattedAmount}
              {' '}
              (
              {draftCurrency}
              )
            </Text>
          </View>
        </Pressable>
      </GlassCard>

      <GlassCard style={{ marginBottom: 12 }}>
        <View style={rowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source="sf:tag" style={{ width: 18, height: 18 }} tintColor={colors.textMuted} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
              Category
            </Text>
          </View>
          <SelectPill
            value={categoryOptions.find(o => o.value === categoryId) ?? categoryOptions[0]}
            options={categoryOptions}
            onValueChange={o => setCategoryId(o?.value ?? '')}
            size="sm"
            leading={(
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: selectedCategory?.color ?? colors.accent,
                }}
              />
            )}
          />
        </View>
        <View style={rowDivider} />
        <View style={rowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source="sf:list.bullet"
              style={{ width: 18, height: 18 }}
              tintColor={colors.textMuted}
            />
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
              List
            </Text>
          </View>
          <SelectPill
            value={listOptions.find(o => o.value === listId) ?? listOptions[0]}
            options={listOptions}
            onValueChange={o => setListId(o?.value ?? '')}
            size="sm"
          />
        </View>
        {isEdit && (
          <>
            <View style={rowDivider} />
            <View style={rowStyle}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
                Status
              </Text>
              <SelectPill
                value={statusOption}
                options={[...STATUS_OPTIONS]}
                onValueChange={o => setStatus((o?.value as SubscriptionStatus) ?? 'active')}
                size="sm"
              />
            </View>
          </>
        )}
        <View style={rowDivider} />
        <View style={rowStyle}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
            Payment method
          </Text>
          <SelectPill
            value={
              paymentMethodOptions.find(o => o.value === paymentMethodId) ?? paymentMethodOptions[0]
            }
            options={paymentMethodOptions}
            onValueChange={o => setPaymentMethodId(o?.value ?? '')}
            size="sm"
          />
        </View>
        <View style={rowDivider} />
        <View style={rowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source="sf:bell" style={{ width: 18, height: 18 }} tintColor={colors.textMuted} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
              Notifications
            </Text>
          </View>
          <SelectPill
            value={notificationOption}
            options={[...NOTIFICATION_OPTIONS]}
            onValueChange={o => setNotificationMode((o?.value as NotificationMode) ?? 'default')}
            size="sm"
          />
        </View>
      </GlassCard>

      <GlassCard style={{ marginBottom: 12 }}>
        <View style={{ paddingVertical: 14, paddingHorizontal: 18, gap: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} selectable>
            Notes
          </Text>
          <TextArea
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes"
            placeholderTextColor={colors.textMuted}
            numberOfLines={4}
            style={{
              backgroundColor: colors.surfaceMuted,
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
              borderRadius: 18,
              borderCurve: 'continuous',
              padding: 12,
              minHeight: 96,
              textAlignVertical: 'top',
              color: colors.text,
            }}
          />
        </View>
      </GlassCard>

    </Fragment>
  );
}
