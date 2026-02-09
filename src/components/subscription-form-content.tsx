import type { MutableRefObject } from 'react';

import type { NotificationMode, ScheduleType, Subscription, SubscriptionStatus } from '@/lib/db/schema';
import { parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { Button, Input, TextArea } from 'heroui-native';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AmountPickerContent, AmountPickerCurrencyPill } from '@/components/amount-picker-content';
import { DatePickerContent } from '@/components/date-picker-content';
import { ModalSheet } from '@/components/modal-sheet';
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
  renderFooter: (props: { isValid: boolean; onSave: () => void }) => React.ReactNode;
  /** Optional ref to call submit from parent (e.g. toolbar). */
  submitRef?: MutableRefObject<(() => void) | null>;
  /** Called when validation state changes (e.g. to disable/enable toolbar button). */
  onValidationChange?: (isValid: boolean) => void;
};

export function SubscriptionFormContent({
  isEdit,
  initialState,
  onSave,
  renderFooter,
  submitRef,
  onValidationChange,
}: SubscriptionFormContentProps) {
  const { colors } = useTheme();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();
  const draftStore = useAddSubscriptionDraftStore();

  const [name, setName] = useState(initialState.name);
  const [amount, setAmount] = useState(initialState.amount);
  const [currency, setCurrency] = useState(initialState.currency);
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
  const [notes, setNotes] = useState(initialState.notes);

  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    if (!isEdit) {
      draftStore.reset({
        amount: '0',
        currency: settings.mainCurrency || 'USD',
        startDate: new Date(),
      });
    }
  }, []);

  const draftAmount = isEdit ? amount : draftStore.amount;
  const draftCurrency = isEdit ? currency : draftStore.currency;
  const draftStartDate = isEdit ? parseISO(startDate) : draftStore.startDate;
  const amountValue = Number(draftAmount);
  const formattedAmount = Number.isFinite(amountValue) ? amountValue.toFixed(2) : '0.00';
  const isValid = name.trim().length > 0 && Number.isFinite(amountValue) && amountValue > 0;

  const handleAmountPress = useCallback(() => {
    if (isEdit) {
      draftStore.reset({
        amount: amount || '0',
        currency,
        startDate: parseISO(startDate),
      });
    }
    setShowAmountPicker(true);
  }, [isEdit, amount, currency, startDate, draftStore]);

  const handleAmountDone = useCallback(() => {
    if (isEdit) {
      setAmount(draftStore.amount);
      setCurrency(draftStore.currency);
    }
    setShowAmountPicker(false);
  }, [isEdit, draftStore]);

  const handleDatePress = useCallback(() => {
    if (isEdit) {
      draftStore.reset({
        amount,
        currency,
        startDate: parseISO(startDate),
      });
    }
    setShowDatePicker(true);
  }, [isEdit, amount, currency, startDate, draftStore]);

  const handleDateDone = useCallback(() => {
    if (isEdit) {
      setStartDate(toIsoLocalDate(draftStore.startDate));
    }
    setShowDatePicker(false);
  }, [isEdit, draftStore]);

  const handleSave = useCallback(() => {
    if (!isValid)
      return;

    const finalAmount = isEdit ? amountValue : Number(draftStore.amount);
    const finalCurrency = isEdit ? currency : draftStore.currency;
    const finalStartDate = isEdit
      ? (isValidDateString(startDate) ? startDate : todayIsoDate())
      : toIsoLocalDate(draftStore.startDate);
    const normalizedIntervalCount
      = scheduleType === 'custom' ? Math.max(1, Number(intervalCount) || 1) : 1;

    const payload: SubscriptionFormPayload = {
      name: name.trim(),
      status,
      iconType: 'builtIn',
      iconKey: iconKey.trim() || 'custom',
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
      <View style={{ alignItems: 'center', paddingVertical: 6 }}>
        <ServiceIcon iconKey={iconKey} size={72} />
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
              $
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

      {renderFooter({ isValid, onSave: handleSave })}

      <ModalSheet
        title=""
        closeButtonTitle="Close"
        isVisible={showAmountPicker}
        onClose={() => setShowAmountPicker(false)}
        topRightActionBar={<AmountPickerCurrencyPill />}
        enableDynamicSizing
        bottomScrollSpacer={24}
      >
        <AmountPickerContent onDone={handleAmountDone} />
      </ModalSheet>

      <ModalSheet
        title="Start Date"
        closeButtonTitle="Close"
        isVisible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        enableDynamicSizing
        bottomScrollSpacer={24}
        scrollViewProps={{ bounces: false }}
      >
        <DatePickerContent onDone={handleDateDone} />
      </ModalSheet>
    </Fragment>
  );
}
