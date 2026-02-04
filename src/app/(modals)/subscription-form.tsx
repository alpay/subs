import type { DatePickerRef } from 'rn-awesome-date-picker';
import type { Category, List, PaymentMethod, ServiceTemplate, Subscription } from '@/lib/db/schema';
import { format, formatISO, parseISO } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DatePicker from 'rn-awesome-date-picker';
import AmountKeypad from '@/components/subscriptions/amount-keypad';
import ServiceIcon from '@/components/subscriptions/service-icon';
import { Image, Input, Pressable, ScrollView, Select, Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
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

type InitialState = {
  name: string;
  scheduleType: Subscription['scheduleType'];
  intervalCount: string;
  intervalUnit: 'week' | 'month';
  startDateValue: Date | null;
  amountValue: string;
  currency: string;
  categoryId: string;
  listId: string;
  paymentMethodId?: string;
  notificationMode: 'default' | 'custom' | 'none';
  notes: string;
  iconType: 'builtIn' | 'image';
  iconKey: string;
  iconUri?: string;
};

type InitialStateInput = {
  existing?: Subscription;
  template?: ServiceTemplate;
  categories: Category[];
  lists: List[];
  settingsCurrency: string;
};

function buildInitialState({ existing, template, categories, lists, settingsCurrency }: InitialStateInput): InitialState {
  if (existing) {
    return {
      name: existing.name,
      scheduleType: existing.scheduleType,
      intervalCount: String(existing.intervalCount),
      intervalUnit: existing.intervalUnit ?? 'month',
      startDateValue: parseISO(existing.startDate),
      amountValue: String(existing.amount),
      currency: existing.currency,
      categoryId: existing.categoryId,
      listId: existing.listId,
      paymentMethodId: existing.paymentMethodId,
      notificationMode: existing.notificationMode,
      notes: existing.notes ?? '',
      iconType: existing.iconType,
      iconKey: existing.iconKey ?? 'custom',
      iconUri: existing.iconUri,
    };
  }

  const categoryId = template?.defaultCategoryId ?? categories[0]?.id ?? '';
  const listId = lists[0]?.id ?? '';

  return {
    name: template?.name ?? '',
    scheduleType: template?.defaultScheduleType ?? 'monthly',
    intervalCount: '1',
    intervalUnit: 'month',
    startDateValue: new Date(),
    amountValue: '',
    currency: settingsCurrency,
    categoryId,
    listId,
    paymentMethodId: undefined,
    notificationMode: 'default',
    notes: '',
    iconType: 'builtIn',
    iconKey: template?.iconKey ?? 'custom',
    iconUri: undefined,
  };
}

export default function SubscriptionFormScreen() {
  useBootstrap();
  const params = useLocalSearchParams<{ id?: string; templateId?: string }>();
  const { subscriptions } = useSubscriptionsStore();
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

  const initialState = useMemo(
    () => buildInitialState({
      existing,
      template,
      categories,
      lists,
      settingsCurrency: settings.mainCurrency,
    }),
    [existing, template, categories, lists, settings.mainCurrency],
  );

  const formKey = existing?.id ?? template?.id ?? 'new';

  return (
    <SubscriptionFormContent
      key={formKey}
      existing={existing}
      categories={categories}
      lists={lists}
      methods={methods}
      templates={templates}
      settingsCurrency={settings.mainCurrency}
      rates={rates}
      initialState={initialState}
    />
  );
}

type FormContentProps = {
  existing?: Subscription;
  categories: Category[];
  lists: List[];
  methods: PaymentMethod[];
  templates: ServiceTemplate[];
  settingsCurrency: string;
  rates: { rates: Record<string, number> };
  initialState: InitialState;
};

function SubscriptionFormContent({
  existing,
  categories,
  lists,
  methods,
  templates,
  settingsCurrency,
  rates,
  initialState,
}: FormContentProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { add, update } = useSubscriptionsStore();
  const { top } = useSafeAreaInsets();

  const [name, setName] = useState(() => initialState.name);
  const [scheduleType, setScheduleType] = useState<Subscription['scheduleType']>(() => initialState.scheduleType);
  const [intervalCount, setIntervalCount] = useState(() => initialState.intervalCount);
  const [intervalUnit, setIntervalUnit] = useState<'week' | 'month'>(() => initialState.intervalUnit);
  const [startDateValue, setStartDateValue] = useState<Date | null>(() => initialState.startDateValue);
  const [amountValue, setAmountValue] = useState(() => initialState.amountValue);
  const [currency, setCurrency] = useState(() => initialState.currency || settingsCurrency);
  const [categoryId, setCategoryId] = useState(() => initialState.categoryId);
  const [listId, setListId] = useState(() => initialState.listId);
  const [paymentMethodId, setPaymentMethodId] = useState<string | undefined>(() => initialState.paymentMethodId);
  const [notificationMode, setNotificationMode] = useState<'default' | 'custom' | 'none'>(() => initialState.notificationMode);
  const [notes, setNotes] = useState(() => initialState.notes);
  const [iconType, setIconType] = useState<'builtIn' | 'image'>(() => initialState.iconType);
  const [iconKey, setIconKey] = useState(() => initialState.iconKey);
  const [iconUri, setIconUri] = useState<string | undefined>(() => initialState.iconUri);

  const amountSheet = useModal();
  const datePickerRef = useRef<DatePickerRef>(null);

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

  const iconOptions = useMemo(() => {
    const seen = new Set<string>();
    return templates
      .map(item => item.iconKey)
      .filter((key) => {
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }, [templates]);

  const startDate = startDateValue
    ? formatISO(startDateValue, { representation: 'date' })
    : formatISO(new Date(), { representation: 'date' });

  const isValid = name.trim().length > 0 && Number(amountValue) > 0 && Boolean(startDate);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setIconType('image');
    setIconUri(asset.uri);
  };

  const handleSave = () => {
    if (!isValid) {
      return;
    }

    const base = {
      name: name.trim(),
      status: existing?.status ?? 'active',
      iconType,
      iconKey: iconType === 'builtIn' ? iconKey : undefined,
      iconUri: iconType === 'image' ? iconUri : undefined,
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
    }
    else {
      add(base as any);
    }

    router.back();
  };

  const displayDate = startDateValue ? format(startDateValue, 'd MMM yyyy') : 'Select date';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background, paddingTop: top }}>
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
        <View className="mt-6 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-sm" style={{ color: colors.secondaryText }}>
            Icon
          </Text>
          <View className="mt-3 flex-row items-center">
            <View className="mr-4 size-12 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.background }}>
              {iconType === 'image' && iconUri
                ? (
                    <Image source={{ uri: iconUri }} className="size-10 rounded-xl" />
                  )
                : (
                    <ServiceIcon iconKey={iconKey} size={24} />
                  )}
            </View>
            <Pressable
              onPress={handlePickImage}
              className="rounded-2xl px-4 py-2"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-sm" style={{ color: colors.text }}>
                Pick Image
              </Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row">
              {iconOptions.map(key => (
                <Pressable
                  key={key}
                  onPress={() => {
                    setIconType('builtIn');
                    setIconKey(key);
                    setIconUri(undefined);
                  }}
                  className="mr-3 items-center justify-center rounded-2xl p-3"
                  style={{ backgroundColor: colors.background }}
                >
                  <ServiceIcon iconKey={key} size={20} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-4 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
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
          <Pressable
            onPress={() => datePickerRef.current?.open()}
            className="mt-2 rounded-2xl px-4 py-3"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-xs" style={{ color: colors.secondaryText }}>
              Start Date
            </Text>
            <Text className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>
              {displayDate}
            </Text>
          </Pressable>
        </View>

        <View className="mt-4 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Pressable onPress={() => amountSheet.present()}>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Amount
            </Text>
            <Text className="mt-2 text-xl font-semibold" style={{ color: colors.text }}>
              {amountValue.length ? amountValue : '0.00'}
              {' '}
              {currency}
            </Text>
          </Pressable>
          <Select
            label="Currency"
            value={currency}
            options={currencyOptions}
            onSelect={value => setCurrency(String(value))}
          />
        </View>

        <View className="mt-4 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
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

        <View className="mt-4 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
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

      <DatePicker
        ref={datePickerRef}
        mode="single"
        value={startDateValue}
        onChange={date => setStartDateValue(date)}
        showInput={false}
        activeDateBackgroundColor={colors.primary}
        activeDateTextColor={colors.headerText}
        dateTextColor={colors.text}
        farDateTextColor={colors.secondaryText}
        bottomSheetModalProps={{
          snapPoints: ['90%'],
        }}
        cancelButtonText="Cancel"
        chooseDateButtonText="Choose date"
      />
    </View>
  );
}
