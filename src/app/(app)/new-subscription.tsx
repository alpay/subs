import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, useToast } from 'heroui-native';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';

const SCHEDULE_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekly', value: 'weekly' },
] as const;

const NOTIFICATION_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Custom', value: 'custom' },
  { label: 'None', value: 'none' },
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

export default function NewSubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; iconKey?: string }>();
  const paramName = typeof params.name === 'string' ? params.name : params.name?.[0];
  const paramIconKey = typeof params.iconKey === 'string' ? params.iconKey : params.iconKey?.[0];
  const { toast } = useToast();
  const { colors } = useTheme();
  const { settings } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { rates } = useCurrencyRatesStore();
  const { add } = useSubscriptionsStore();
  const { amount, currency, startDate, setCurrency, reset } = useAddSubscriptionDraftStore();

  const [name, setName] = useState(() => paramName ?? '');
  const [iconKey] = useState(() => paramIconKey ?? 'custom');
  const [schedule, setSchedule] = useState<(typeof SCHEDULE_OPTIONS)[number]['value']>('monthly');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [listId, setListId] = useState(lists[0]?.id ?? '');
  const [notificationMode, setNotificationMode] = useState<(typeof NOTIFICATION_OPTIONS)[number]['value']>('default');
  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const amountValue = Number(amount);
  const formattedAmount = Number.isFinite(amountValue) ? amountValue.toFixed(2) : '0.00';

  const isValid = name.trim().length > 0 && Number.isFinite(amountValue) && amountValue > 0;

  const scheduleOption = useMemo(
    () => SCHEDULE_OPTIONS.find(option => option.value === schedule),
    [schedule],
  );
  const currencyOptions = useMemo(
    () => Object.keys(rates.rates).sort().map(code => ({ label: code, value: code })),
    [rates.rates],
  );
  const categoryOptions = useMemo(
    () => categories.map(category => ({ label: category.name, value: category.id, color: category.color })),
    [categories],
  );
  const listOptions = useMemo(
    () => lists.map(list => ({ label: list.name, value: list.id })),
    [lists],
  );
  const notificationOption = useMemo(
    () => NOTIFICATION_OPTIONS.find(option => option.value === notificationMode),
    [notificationMode],
  );
  const selectedCategory = useMemo(
    () => categories.find(category => category.id === categoryId) ?? categories[0],
    [categories, categoryId],
  );
  useEffect(() => {
    if (currencyOptions.length > 0 && !currencyOptions.some(option => option.value === currency)) {
      setCurrency(currencyOptions[0].value);
    }
  }, [currency, currencyOptions, setCurrency]);

  useEffect(() => {
    reset({ amount: '0', currency: settings.mainCurrency || 'USD', startDate: new Date() });
  }, [reset, settings.mainCurrency]);

  const handleAmountPress = useCallback(() => {
    setShowAmountPicker(true);
  }, []);

  const handleDatePress = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!isValid) {
      toast.show('Please fill name and amount before saving');
      return;
    }

    const normalizedDate = toIsoLocalDate(startDate);

    add({
      name: name.trim(),
      status: 'active',
      iconType: 'builtIn',
      iconKey: iconKey || 'custom',
      amount: amountValue,
      currency,
      scheduleType: schedule,
      intervalCount: 1,
      billingAnchor: normalizedDate,
      startDate: normalizedDate,
      categoryId: categoryId || categoryOptions[0]?.value || '',
      listId: listId || listOptions[0]?.value || '',
      notificationMode,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    reset({ amount: '0', currency: settings.mainCurrency || 'USD', startDate: new Date() });
    router.back();
  }, [
    add,
    amountValue,
    categoryId,
    categoryOptions,
    currency,
    iconKey,
    isValid,
    listId,
    listOptions,
    name,
    notificationMode,
    notes,
    reset,
    router,
    schedule,
    settings.mainCurrency,
    startDate,
    toast,
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
        title="New Subscription"
        footer={(
          <Button
            variant="primary"
            size="lg"
            isDisabled={!isValid}
            onPress={handleSave}
            style={{ width: '100%' }}
          >
            Add Subscription
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
                onValueChange={option => setSchedule((option?.value as typeof schedule) ?? 'monthly')}
                size="sm"
              />
            </View>

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
                  style={{
                    fontSize: 12,
                    color: colors.text,
                    fontVariant: ['tabular-nums'],
                  }}
                  selectable
                >
                  {formatDateLabel(startDate)}
                </Text>
              </View>
            </Pressable>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body style={{ padding: 0, gap: 0 }}>
            <Pressable
              onPress={handleAmountPress}
              hitSlop={8}
              accessibilityRole="button"
              style={rowStyle}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                Amount
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    fontVariant: ['tabular-nums'],
                  }}
                  selectable
                >
                  $
                  {formattedAmount}
                  {' '}
                  (
                  {currency}
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
                <Image
                  source="sf:tag"
                  style={{ width: 16, height: 16 }}
                  tintColor={colors.textMuted}
                />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                  Category
                </Text>
              </View>
              <SelectPill
                value={categoryOptions.find(option => option.value === categoryId) ?? categoryOptions[0]}
                options={categoryOptions}
                onValueChange={option => setCategoryId(option?.value ?? '')}
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
                <Image
                  source="sf:list.bullet"
                  style={{ width: 16, height: 16 }}
                  tintColor={colors.textMuted}
                />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                  List
                </Text>
              </View>
              <SelectPill
                value={listOptions.find(option => option.value === listId) ?? listOptions[0]}
                options={listOptions}
                onValueChange={option => setListId(option?.value ?? '')}
                size="sm"
              />
            </View>

            <View style={rowStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image
                  source="sf:bell"
                  style={{ width: 16, height: 16 }}
                  tintColor={colors.textMuted}
                />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                  Notifications
                </Text>
              </View>
              <SelectPill
                value={notificationOption}
                options={[...NOTIFICATION_OPTIONS]}
                onValueChange={option => setNotificationMode((option?.value as typeof notificationMode) ?? 'default')}
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
        <AmountPickerContent onDone={() => setShowAmountPicker(false)} />
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
        <DatePickerContent onDone={() => setShowDatePicker(false)} />
      </ModalSheet>
    </Fragment>
  );
}
