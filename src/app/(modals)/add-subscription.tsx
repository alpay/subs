import type { BottomSheetBackdropProps, BottomSheetMethods } from '@gorhom/bottom-sheet';

import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Button, Select } from 'heroui-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DatePicker, { type DatePickerRef } from 'rn-awesome-date-picker';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalSheet } from '@/components/modal-sheet';
import { useSelectPopoverStyles } from '@/components/select-popover';
import { SheetInput, SheetTextArea } from '@/components/sheet-input';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  useSettingsStore,
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

const AMOUNT_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
] as const;

type AmountKey = (typeof AMOUNT_KEYS)[number][number];

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AddSubscriptionScreen() {
  useBootstrap();
  const { colors, isDark } = useTheme();
  const popoverStyles = useSelectPopoverStyles();
  const { settings } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { rates } = useCurrencyRatesStore();
  const { bottom } = useSafeAreaInsets();
  const amountSheetRef = useRef<BottomSheetMethods>(null);
  const datePickerRef = useRef<DatePickerRef>(null);

  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<(typeof SCHEDULE_OPTIONS)[number]['value']>('monthly');
  const [startDate, setStartDate] = useState(() => new Date());
  const [amount, setAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState(settings.mainCurrency || 'USD');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [listId, setListId] = useState(lists[0]?.id ?? '');
  const [notificationMode, setNotificationMode] = useState<(typeof NOTIFICATION_OPTIONS)[number]['value']>('default');
  const [isAmountSheetOpen, setIsAmountSheetOpen] = useState(false);

  const amountValue = Number(amount);
  const formattedAmount = Number.isFinite(amountValue) ? amountValue.toFixed(2) : '0.00';
  const sheetAmount = amount.trim().length > 0 ? amount : '0';

  const isValid = name.trim().length > 0 && Number.isFinite(amountValue) && amountValue > 0;

  const amountSnapPoints = useMemo(() => ['72%'], []);
  const amountSheetIndex = isAmountSheetOpen ? 0 : -1;
  const scheduleOption = useMemo(
    () => SCHEDULE_OPTIONS.find(option => option.value === schedule),
    [schedule],
  );
  const currencyOptions = useMemo(
    () => Object.keys(rates.rates).sort().map(code => ({ label: code, value: code })),
    [rates.rates],
  );
  const currencyOption = useMemo(
    () => currencyOptions.find(option => option.value === currency),
    [currency, currencyOptions],
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
    () => categories.find(category => category.id === categoryId),
    [categories, categoryId],
  );
  const selectedList = useMemo(
    () => lists.find(list => list.id === listId),
    [lists, listId],
  );

  useEffect(() => {
    if (!categoryId && categoryOptions.length > 0) {
      setCategoryId(categoryOptions[0].value);
    }
  }, [categoryId, categoryOptions]);

  useEffect(() => {
    if (!listId && listOptions.length > 0) {
      setListId(listOptions[0].value);
    }
  }, [listId, listOptions]);

  useEffect(() => {
    if (currencyOptions.length > 0 && !currencyOptions.some(option => option.value === currency)) {
      setCurrency(currencyOptions[0].value);
    }
  }, [currency, currencyOptions]);

  const handleAmountPress = useCallback(() => {
    setIsAmountSheetOpen(true);
  }, []);

  const handleAmountClose = useCallback(() => {
    setIsAmountSheetOpen(false);
  }, []);

  const handleDatePress = useCallback(() => {
    datePickerRef.current?.open();
  }, []);

  const handleAmountKeyPress = useCallback((key: AmountKey) => {
    setAmount(prev => {
      if (key === 'back') {
        const next = prev.length > 1 ? prev.slice(0, -1) : '0';
        return next === '' ? '0' : next;
      }

      if (key === '.') {
        if (prev.includes('.')) {
          return prev;
        }
        return `${prev}.`;
      }

      if (prev === '0') {
        return key;
      }

      const [whole, fraction] = prev.split('.');
      if (fraction !== undefined && fraction.length >= 2) {
        return prev;
      }

      return `${prev}${key}`;
    });
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );

  const handleAmountSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setIsAmountSheetOpen(false);
    }
  }, []);

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
    <>
      <ModalSheet
        title="New Subscription"
        footer={
          <Button variant="primary" size="lg" isDisabled={!isValid} style={{ width: '100%' }}>
            Add Subscription
          </Button>
        }
      >
        <View style={{ alignItems: 'center', paddingVertical: 6 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              borderCurve: 'continuous',
              backgroundColor: colors.surfaceElevated,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
              boxShadow: isDark
                ? '0 14px 24px rgba(0, 0, 0, 0.35)'
                : '0 12px 20px rgba(15, 23, 42, 0.12)',
            }}
          >
            <Image
              source="sf:diamond.fill"
              style={{ width: 28, height: 28 }}
              tintColor={colors.text}
            />
          </View>
        </View>

        <GlassCard>
          <GlassCardBody style={{ padding: 0, gap: 0 }}>
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

            <Select
              value={scheduleOption}
              onValueChange={option => setSchedule((option?.value as typeof schedule) ?? 'monthly')}
              presentation="popover"
            >
              <Select.Trigger
                style={({ pressed }) => [
                  rowStyle,
                  rowDivider,
                  pressed ? { opacity: 0.85 } : null,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} selectable>
                    Schedule
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                    {scheduleOption?.label ?? 'Select'}
                  </Text>
                  <Image
                    source="sf:chevron.down"
                    style={{ width: 12, height: 12 }}
                    tintColor={colors.textMuted}
                  />
                </View>
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content
                  presentation="popover"
                  align="start"
                  width="trigger"
                  style={popoverStyles.content}
                >
                  {SCHEDULE_OPTIONS.map(option => (
                    <Select.Item key={option.value} value={option.value} label={option.label} />
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>

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
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ padding: 0, gap: 0 }}>
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
                  ${formattedAmount} ({currency})
                </Text>
              </View>
            </Pressable>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ padding: 0, gap: 0 }}>
            <Select
              value={categoryOptions.find(option => option.value === categoryId)}
              onValueChange={option => setCategoryId(option?.value ?? '')}
              presentation="popover"
            >
              <Select.Trigger
                style={({ pressed }) => [
                  rowStyle,
                  rowDivider,
                  pressed ? { opacity: 0.85 } : null,
                ]}
              >
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: selectedCategory?.color ?? colors.accent,
                    }}
                  />
                  <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                    {selectedCategory?.name ?? 'Select'}
                  </Text>
                  <Image
                    source="sf:chevron.down"
                    style={{ width: 12, height: 12 }}
                    tintColor={colors.textMuted}
                  />
                </View>
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content
                  presentation="popover"
                  align="start"
                  width="trigger"
                  style={popoverStyles.content}
                >
                  {categoryOptions.map(option => (
                    <Select.Item key={option.value} value={option.value} label={option.label} />
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>

            <Select
              value={listOptions.find(option => option.value === listId)}
              onValueChange={option => setListId(option?.value ?? '')}
              presentation="popover"
            >
              <Select.Trigger
                style={({ pressed }) => [
                  rowStyle,
                  rowDivider,
                  pressed ? { opacity: 0.85 } : null,
                ]}
              >
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                    {selectedList?.name ?? 'Select'}
                  </Text>
                  <Image
                    source="sf:chevron.down"
                    style={{ width: 12, height: 12 }}
                    tintColor={colors.textMuted}
                  />
                </View>
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content
                  presentation="popover"
                  align="start"
                  width="trigger"
                  style={popoverStyles.content}
                >
                  {listOptions.map(option => (
                    <Select.Item key={option.value} value={option.value} label={option.label} />
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>

            <Select
              value={notificationOption}
              onValueChange={option => setNotificationMode((option?.value as typeof notificationMode) ?? 'default')}
              presentation="popover"
            >
              <Select.Trigger
                style={({ pressed }) => [
                  rowStyle,
                  pressed ? { opacity: 0.85 } : null,
                ]}
              >
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                    {notificationOption?.label ?? 'Select'}
                  </Text>
                  <Image
                    source="sf:chevron.down"
                    style={{ width: 12, height: 12 }}
                    tintColor={colors.textMuted}
                  />
                </View>
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content
                  presentation="popover"
                  align="start"
                  width="trigger"
                  style={popoverStyles.content}
                >
                  {NOTIFICATION_OPTIONS.map(option => (
                    <Select.Item key={option.value} value={option.value} label={option.label} />
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ padding: 16, gap: 10 }}>
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
          </GlassCardBody>
        </GlassCard>
      </ModalSheet>

      <View
        pointerEvents={isAmountSheetOpen ? 'auto' : 'none'}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <BottomSheet
          ref={amountSheetRef}
          index={amountSheetIndex}
          snapPoints={amountSnapPoints}
          onChange={handleAmountSheetChange}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.surface }}
          handleIndicatorStyle={{ backgroundColor: colors.surfaceBorder, width: 40 }}
        >
          <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: bottom + 16, gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Select
              value={currencyOption}
              onValueChange={option => setCurrency(option?.value ?? currency)}
              presentation="popover"
            >
              <Select.Trigger
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderCurve: 'continuous',
                    backgroundColor: colors.surfaceMuted,
                    borderWidth: 1,
                    borderColor: colors.surfaceBorder,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }} selectable>
                  {currencyOption?.label ?? currency}
                </Text>
                <Image
                  source="sf:chevron.down"
                  style={{ width: 12, height: 12 }}
                  tintColor={colors.textMuted}
                />
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content
                  presentation="popover"
                  align="start"
                  width="trigger"
                  style={popoverStyles.content}
                >
                  {currencyOptions.map(option => (
                    <Select.Item key={option.value} value={option.value} label={option.label} />
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>

            <Pressable
              onPress={handleAmountClose}
              style={({ pressed }) => [
                {
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  backgroundColor: colors.surfaceMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.surfaceBorder,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Image
                source="sf:xmark"
                style={{ width: 12, height: 12 }}
                tintColor={colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, letterSpacing: 1.4, color: colors.textMuted }} selectable>
              AMOUNT
            </Text>
            <Text
              style={{
                fontSize: 54,
                fontWeight: '600',
                color: colors.text,
                fontVariant: ['tabular-nums'],
              }}
              selectable
            >
              ${sheetAmount}
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {AMOUNT_KEYS.map(row => (
              <View key={row.join('-')} style={{ flexDirection: 'row', gap: 12 }}>
                {row.map(key => {
                  const isBackspace = key === 'back';
                  return (
                    <Pressable
                      key={key}
                      onPress={() => handleAmountKeyPress(key)}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          height: 56,
                          borderRadius: 18,
                          borderCurve: 'continuous',
                          backgroundColor: colors.surfaceMuted,
                          borderWidth: 1,
                          borderColor: colors.surfaceBorder,
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isDark
                            ? '0 8px 14px rgba(0, 0, 0, 0.25)'
                            : '0 8px 14px rgba(15, 23, 42, 0.08)',
                        },
                        pressed && { opacity: 0.75 },
                      ]}
                    >
                      {isBackspace
                        ? (
                            <Image
                              source="sf:delete.left"
                              style={{ width: 20, height: 20 }}
                              tintColor={colors.text}
                            />
                          )
                        : (
                            <Text
                              style={{ fontSize: 20, fontWeight: '600', color: colors.text }}
                              selectable
                            >
                              {key}
                            </Text>
                          )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Pressable
            onPress={handleAmountClose}
            style={({ pressed }) => [
              {
                marginTop: 8,
                borderRadius: 999,
                borderCurve: 'continuous',
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark ? '#F5F5F5' : colors.text,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDark ? '#1C1C1E' : colors.background,
              }}
              selectable
            >
              Done
            </Text>
          </Pressable>
        </View>
        </BottomSheet>
      </View>

      <DatePicker
        ref={datePickerRef}
        mode="single"
        value={startDate}
        onChange={date => setStartDate(date)}
        showInput={false}
        bottomSheetModalProps={{
          backgroundStyle: { backgroundColor: colors.surface },
          handleIndicatorStyle: { backgroundColor: colors.surfaceBorder, width: 40 },
        }}
        activeDateBackgroundColor={colors.text}
        activeDateTextColor={colors.background}
        dateTextColor={colors.text}
        farDateTextColor={colors.textMuted}
        rangeDateBackgroundColor={colors.surfaceMuted}
        rangeDateTextColor={colors.text}
        containerStyle={{ height: 0, width: 0, opacity: 0 }}
      />
    </>
  );
}
