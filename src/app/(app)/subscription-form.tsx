import type { NotificationMode, ScheduleType, Subscription, SubscriptionStatus } from '@/lib/db/schema';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, useToast } from 'heroui-native';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { parseISO } from 'date-fns';

import { AmountPickerContent, AmountPickerCurrencyPill } from '@/components/amount-picker-content';
import { DatePickerContent } from '@/components/date-picker-content';
import { ModalSheet } from '@/components/modal-sheet';
import { SelectPill } from '@/components/select-pill';
import { ServiceIcon } from '@/components/service-icon';
import { SheetInput, SheetTextArea } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useAddSubscriptionDraftStore,
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
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

export default function SubscriptionFormScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string; templateId?: string; name?: string; iconKey?: string }>();

  const paramName = typeof params.name === 'string' ? params.name : params.name?.[0];
  const paramIconKey = typeof params.iconKey === 'string' ? params.iconKey : params.iconKey?.[0];

  const { subscriptions, add, update } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { templates } = useServiceTemplatesStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();
  const draftStore = useAddSubscriptionDraftStore();

  const existingSubscription = useMemo(
    () => (params.id ? subscriptions.find(s => s.id === params.id) : undefined),
    [params.id, subscriptions],
  );

  const selectedTemplate = useMemo(
    () => (params.templateId ? templates.find(t => t.id === params.templateId) : undefined),
    [params.templateId, templates],
  );

  const isEdit = Boolean(params.id && existingSubscription);

  const formSeed = useMemo(() => {
    if (existingSubscription) {
      return {
        name: existingSubscription.name,
        amount: String(existingSubscription.amount),
        currency: existingSubscription.currency,
        scheduleType: existingSubscription.scheduleType as ScheduleType,
        intervalCount: String(existingSubscription.intervalCount || 1),
        intervalUnit: (existingSubscription.intervalUnit ?? 'month') as 'week' | 'month',
        startDate: existingSubscription.startDate,
        categoryId: existingSubscription.categoryId,
        listId: existingSubscription.listId,
        paymentMethodId: existingSubscription.paymentMethodId ?? '',
        status: existingSubscription.status,
        notificationMode: existingSubscription.notificationMode,
        iconKey: existingSubscription.iconKey ?? 'custom',
        notes: existingSubscription.notes ?? '',
      };
    }
    return {
      name: selectedTemplate?.name ?? paramName ?? '',
      amount: '',
      currency: settings.mainCurrency,
      scheduleType: (selectedTemplate?.defaultScheduleType ?? 'monthly') as ScheduleType,
      intervalCount: '1',
      intervalUnit: 'month' as const,
      startDate: todayIsoDate(),
      categoryId: selectedTemplate?.defaultCategoryId ?? categories[0]?.id ?? '',
      listId: lists[0]?.id ?? '',
      paymentMethodId: '',
      status: 'active' as SubscriptionStatus,
      notificationMode: 'default' as NotificationMode,
      iconKey: selectedTemplate?.iconKey ?? paramIconKey ?? 'custom',
      notes: '',
    };
  }, [existingSubscription, selectedTemplate, paramName, paramIconKey, settings.mainCurrency, categories, lists]);

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
  const [iconKey, setIconKey] = useState(formSeed.iconKey);
  const [notes, setNotes] = useState(formSeed.notes);

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
    if (!isValid) {
      toast.show('Please fill name and amount before saving');
      return;
    }

    const finalAmount = isEdit ? amountValue : Number(draftStore.amount);
    const finalCurrency = isEdit ? currency : draftStore.currency;
    const finalStartDate = isEdit ? (isValidDateString(startDate) ? startDate : todayIsoDate()) : toIsoLocalDate(draftStore.startDate);
    const normalizedIntervalCount = scheduleType === 'custom' ? Math.max(1, Number(intervalCount) || 1) : 1;

    const payload: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'nextPaymentDate'> = {
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

    if (existingSubscription) {
      update({ ...existingSubscription, ...payload });
      toast.show('Subscription updated');
    } else {
      add(payload);
      toast.show('Subscription created');
      if (!isEdit) {
        draftStore.reset({ amount: '0', currency: settings.mainCurrency || 'USD', startDate: new Date() });
      }
    }
    router.back();
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
    existingSubscription,
    update,
    add,
    toast,
    router,
    categoryOptions,
    listOptions,
    settings.mainCurrency,
  ]);

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    width: '100%' as const,
  };

  const rowDivider = {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  };

  return (
    <Fragment>
      <ModalSheet
        title={isEdit ? 'Edit Subscription' : 'New Subscription'}
        footer={(
          <Button
            variant="primary"
            size="lg"
            isDisabled={!isValid}
            onPress={handleSave}
            style={{ width: '100%' }}
          >
            {isEdit ? 'Save changes' : 'Add Subscription'}
          </Button>
        )}
      >
        <View style={{ alignItems: 'center', paddingVertical: 6 }}>
          <ServiceIcon iconKey={iconKey} size={72} />
        </View>

        <Card>
          <Card.Body style={{ padding: 0, gap: 0 }}>
            <View style={[rowStyle, rowDivider]}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                Name
              </Text>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <SheetInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Cursor"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                    textAlign: 'right',
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.text,
                    minHeight: 0,
                  }}
                />
              </View>
            </View>

            <View style={[rowStyle, rowDivider]}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
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
              <View style={[rowStyle, rowDivider]}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                  Interval
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <SheetInput
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
            )}

            <Pressable onPress={handleDatePress} style={rowStyle}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
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
          </Card.Body>
        </Card>

        <Card>
          <Card.Body style={{ padding: 0, gap: 0 }}>
            <Pressable onPress={handleAmountPress} hitSlop={8} accessibilityRole="button" style={rowStyle}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                Amount
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text
                  style={{ fontSize: 14, color: colors.textMuted, fontVariant: ['tabular-nums'] }}
                  selectable
                >
                  $
                  {formattedAmount}
                  {' '}
                  (
                  {draftCurrency}
                  )
                </Text>
              </View>
            </Pressable>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body style={{ padding: 0, gap: 0 }}>
            <View style={[rowStyle, rowDivider]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source="sf:tag" style={{ width: 16, height: 16 }} tintColor={colors.textMuted} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
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
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: selectedCategory?.color ?? colors.accent,
                    }}
                  />
                )}
              />
            </View>

            <View style={[rowStyle, rowDivider]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source="sf:list.bullet" style={{ width: 16, height: 16 }} tintColor={colors.textMuted} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
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
              <View style={[rowStyle, rowDivider]}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                  Status
                </Text>
                <SelectPill
                  value={statusOption}
                  options={[...STATUS_OPTIONS]}
                  onValueChange={o => setStatus((o?.value as SubscriptionStatus) ?? 'active')}
                  size="sm"
                />
              </View>
            )}

            <View style={[rowStyle, rowDivider]}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                Payment method
              </Text>
              <SelectPill
                value={paymentMethodOptions.find(o => o.value === paymentMethodId) ?? paymentMethodOptions[0]}
                options={paymentMethodOptions}
                onValueChange={o => setPaymentMethodId(o?.value ?? '')}
                size="sm"
              />
            </View>

            <View style={rowStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source="sf:bell" style={{ width: 16, height: 16 }} tintColor={colors.textMuted} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
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
          </Card.Body>
        </Card>

        <Card>
          <Card.Body style={{ padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
              Notes
            </Text>
            <SheetTextArea
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
          </Card.Body>
        </Card>
      </ModalSheet>

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
