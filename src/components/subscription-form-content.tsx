import type { MutableRefObject } from 'react';

import type { NotificationMode, ScheduleType, Subscription, SubscriptionStatus } from '@/lib/db/schema';
import { Button, DatePicker, Host, Menu } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, fixedSize, labelStyle } from '@expo/ui/swift-ui/modifiers';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Input, TextArea } from 'heroui-native';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { ServiceIcon } from '@/components/service-icon';
import { GlassCard } from '@/components/ui/glass-card';
import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useAddSubscriptionDraftStore,
  useCategoriesStore,
  useListsStore,
  usePaymentMethodsStore,
  useSettingsStore,
} from '@/lib/stores';
import { getCurrencySymbol } from '@/lib/utils/format';
import { toLocalDateString } from '@/lib/utils/subscription-dates';

const SCHEDULE_OPTION_VALUES = ['monthly', 'yearly', 'weekly', 'custom'] as const;
const STATUS_OPTION_VALUES = ['active', 'paused', 'canceled'] as const;
const NOTIFICATION_OPTION_VALUES = ['default', 'disabled'] as const;
const INTERVAL_UNIT_VALUES = ['month', 'week'] as const;

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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { settings } = useSettingsStore();
  const draftStore = useAddSubscriptionDraftStore();

  const scheduleOptions = useMemo(
    () => SCHEDULE_OPTION_VALUES.map(value => ({ label: t(`subscription.${value}`), value })),
    [t],
  );
  const statusOptions = useMemo(
    () => STATUS_OPTION_VALUES.map(value => ({ label: t(`subscription.status_${value}`), value })),
    [t],
  );
  const notificationOptions = useMemo(
    () => NOTIFICATION_OPTION_VALUES.map(value => ({ label: t(`subscription.notification_${value}`), value })),
    [t],
  );
  const intervalUnitOptions = useMemo(
    () => INTERVAL_UNIT_VALUES.map(value => ({ label: t(`subscription.${value}`), value })),
    [t],
  );

  const [name, setName] = useState(initialState.name);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(initialState.scheduleType);
  const [intervalCount, setIntervalCount] = useState(initialState.intervalCount);
  const [intervalUnit, setIntervalUnit] = useState<'week' | 'month'>(initialState.intervalUnit);
  const [categoryId, setCategoryId] = useState(initialState.categoryId);
  const [listId, setListId] = useState(initialState.listId);
  const [paymentMethodId, setPaymentMethodId] = useState(initialState.paymentMethodId);
  const [status, setStatus] = useState<SubscriptionStatus>(initialState.status);
  const [notificationMode, setNotificationMode] = useState<NotificationMode>(initialState.notificationMode);
  const [notes, setNotes] = useState(initialState.notes);

  const { iconKey, iconUri } = initialState;

  const categoryOptions = useMemo(
    () => categories.map(c => ({ label: c.name, value: c.id, color: c.color })),
    [categories],
  );
  const listOptions = useMemo(
    () => lists.map(l => ({ label: l.name, value: l.id })),
    [lists],
  );
  const paymentMethodOptions = useMemo(
    () => [{ label: t('subscription.none'), value: '' }, ...methods.map(m => ({ label: m.name, value: m.id }))],
    [methods, t],
  );

  const scheduleLabel = useMemo(
    () => scheduleOptions.find(o => o.value === scheduleType)?.label ?? t('subscription.monthly'),
    [scheduleType, scheduleOptions, t],
  );

  useEffect(() => {
    // Seed draft store for both create and edit flows so amount picker route works consistently.
    useAddSubscriptionDraftStore.getState().reset({
      amount: initialState.amount || '0',
      currency: initialState.currency || settings.mainCurrency || 'USD',
      startDate: isValidDateString(initialState.startDate)
        ? new Date(initialState.startDate)
        : new Date(),
    });
  }, [initialState.amount, initialState.currency, initialState.startDate, settings.mainCurrency]);

  const draftAmount = draftStore.amount;
  const draftCurrency = draftStore.currency;
  const draftStartDate = draftStore.startDate;
  const amountValue = Number(draftAmount);
  const formattedAmount = Number.isFinite(amountValue) ? amountValue.toFixed(2) : '0.00';
  const isValid = name.trim().length > 0 && Number.isFinite(amountValue) && amountValue > 0;

  const handleAmountPress = useCallback(() => {
    router.push('/(app)/amount-picker');
  }, [router]);

  const handleSave = useCallback(() => {
    if (!isValid)
      return;

    const finalAmount = Number(draftStore.amount);
    const finalCurrency = draftStore.currency;
    const finalStartDate = toLocalDateString(draftStore.startDate);
    const normalizedIntervalCount
      = scheduleType === 'custom' ? Math.max(1, Number(intervalCount) || 1) : 1;

    const useImageIcon = Boolean(iconUri?.trim());
    const payload: SubscriptionFormPayload = {
      name: name.trim(),
      status,
      iconType: useImageIcon ? 'image' : 'builtIn',
      iconKey: useImageIcon ? undefined : (iconKey.trim() || 'custom'),
      iconUri: useImageIcon ? (iconUri ?? '').trim() : undefined,
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
    draftStore,
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
    if (!submitRef)
      return;
    const ref = submitRef;
    // eslint-disable-next-line react-compiler/react-compiler -- ref.current is the standard imperative handle pattern
    ref.current = handleSave;
    return () => {
      ref.current = null;
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
    paddingHorizontal: 24,
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
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    minHeight: 0,
  };

  return (
    <Fragment>
      <View style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 24 }}>
        <ServiceIcon iconKey={iconKey} iconUri={iconUri ?? undefined} size={72} />
      </View>

      <GlassCard style={{ marginBottom: 12 }}>
        <View style={rowStyle}>
          <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
            {t('subscription.name')}
          </Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder={t('subscription.name_placeholder')}
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
            />
          </View>
        </View>
        <View style={rowDivider} />
        <View style={rowStyle}>
          <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
            {t('subscription.schedule')}
          </Text>
          <Host matchContents>
            <Menu label={scheduleLabel} systemImage="chevron.up.chevron.down" modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass'), controlSize('mini')]}>
              {scheduleOptions.map(option => (
                <Button
                  systemImage={option.value === scheduleType ? 'checkmark' : undefined}
                  label={option.label}
                  key={option.value}
                  onPress={() => {
                    Haptic.Light();
                    setScheduleType(option.value as ScheduleType);
                  }}
                />
              ))}
            </Menu>
          </Host>
        </View>
        {scheduleType === 'custom' && (
          <>
            <View style={rowDivider} />
            <View style={rowStyle}>
              <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
                {t('subscription.interval')}
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
                <Host matchContents>
                  <Menu
                    systemImage="chevron.up.chevron.down"
                    label={intervalUnitOptions.find(o => o.value === intervalUnit)?.label ?? t('subscription.month')}
                    modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass'), controlSize('mini')]}
                  >
                    {intervalUnitOptions.map(option => (
                      <Button
                        key={option.value}
                        systemImage={option.value === intervalUnit ? 'checkmark' : undefined}
                        label={option.label}
                        onPress={() => {
                          Haptic.Light();
                          setIntervalUnit(option.value as 'week' | 'month');
                        }}
                      />
                    ))}
                  </Menu>
                </Host>
              </View>
            </View>
          </>
        )}
        <View style={rowDivider} />
        <View style={rowStyle}>
          <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
            {t('subscription.start_date')}
          </Text>
          <Host matchContents>
            <DatePicker
              selection={draftStartDate}
              displayedComponents={['date']}
              onDateChange={(date) => {
                draftStore.setStartDate(date);
              }}
            />
          </Host>
        </View>
      </GlassCard>

      <GlassCard style={{ marginBottom: 12 }}>
        <Pressable
          onPress={() => {
            Haptic.Light();
            handleAmountPress();
          }}
          hitSlop={8}
          accessibilityRole="button"
          style={rowStyle}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
              {t('common.amount')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{ fontSize: 16, color: colors.text, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {`${getCurrencySymbol(draftCurrency)}${formattedAmount}`}
            </Text>
            <Text
              style={{ fontSize: 16, color: colors.textMuted, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {`(${draftCurrency})`}
            </Text>
          </View>
        </Pressable>
      </GlassCard>

      <GlassCard style={{ marginBottom: 12 }}>
        <View style={rowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source="sf:tag" style={{ width: 18, height: 18 }} tintColor={colors.textMuted} />
            <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
              {t('subscription.category')}
            </Text>
          </View>
          <Host matchContents>
            <Menu
              systemImage="chevron.up.chevron.down"
              label={
                categoryOptions.find(o => o.value === categoryId)?.label
                || categoryOptions[0]?.label
                || t('subscription.category')
              }
              modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass'), controlSize('mini')]}
            >
              {categoryOptions.map(option => (
                <Button
                  key={option.value}
                  systemImage={option.value === categoryId ? 'checkmark' : undefined}
                  label={option.label}
                  onPress={() => {
                    Haptic.Light();
                    setCategoryId(option.value);
                  }}
                />
              ))}
            </Menu>
          </Host>
        </View>

        <View style={rowDivider} />

        <View style={rowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source="sf:list.bullet" style={{ width: 18, height: 18 }} tintColor={colors.textMuted} />
            <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
              {t('subscription.list')}
            </Text>
          </View>
          <Host matchContents>
            <Menu
              systemImage="chevron.up.chevron.down"
              label={
                listOptions.find(o => o.value === listId)?.label
                || listOptions[0]?.label
                || t('subscription.list')
              }
              modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass'), controlSize('mini')]}
            >
              {listOptions.map(option => (
                <Button
                  key={option.value}
                  systemImage={option.value === listId ? 'checkmark' : undefined}
                  label={option.label}
                  onPress={() => {
                    Haptic.Light();
                    setListId(option.value);
                  }}
                />
              ))}
            </Menu>
          </Host>
        </View>

        {isEdit && (
          <>
            <View style={rowDivider} />
            <View style={rowStyle}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image
                  source="sf:checkmark.circle"
                  style={{ width: 18, height: 18 }}
                  tintColor={colors.textMuted}
                />
                <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
                  {t('subscription.status')}
                </Text>
              </View>
              <Host matchContents>
                <Menu
                  systemImage="chevron.up.chevron.down"
                  label={
                    statusOptions.find(o => o.value === status)?.label
                    || statusOptions[0]?.label
                    || t('subscription.status')
                  }
                  modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass'), controlSize('mini')]}
                >
                  {statusOptions.map(option => (
                    <Button
                      key={option.value}
                      systemImage={option.value === status ? 'checkmark' : undefined}
                      label={option.label}
                      onPress={() => {
                        Haptic.Light();
                        setStatus(option.value as SubscriptionStatus);
                      }}
                    />
                  ))}
                </Menu>
              </Host>
            </View>
          </>
        )}

        <View style={rowDivider} />

        <View style={rowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source="sf:creditcard"
              style={{ width: 18, height: 18 }}
              tintColor={colors.textMuted}
            />
            <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
              {t('subscription.pay_with')}
            </Text>
          </View>
          <Host matchContents>
            <Menu
              systemImage="chevron.up.chevron.down"
              label={
                paymentMethodOptions.find(o => o.value === paymentMethodId)?.label
                || paymentMethodOptions[0]?.label
                || t('subscription.payment_method')
              }
              modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass'), controlSize('mini')]}
            >
              {paymentMethodOptions.map(option => (
                <Button
                  key={option.value}
                  systemImage={option.value === paymentMethodId ? 'checkmark' : undefined}
                  label={option.label}
                  onPress={() => {
                    Haptic.Light();
                    setPaymentMethodId(option.value);
                  }}
                />
              ))}
            </Menu>
          </Host>
        </View>

        <View style={rowDivider} />

        <View style={rowStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source="sf:bell" style={{ width: 18, height: 18 }} tintColor={colors.textMuted} />
            <Text style={{ fontSize: 16, color: colors.textMuted }} selectable>
              {t('subscription.notifications')}
            </Text>
          </View>
          <Host matchContents>
            <Menu
              systemImage="chevron.up.chevron.down"
              label={
                notificationOptions.find(o => o.value === notificationMode)?.label
                || notificationOptions[0]?.label
                || t('subscription.notifications')
              }
              modifiers={[fixedSize(), labelStyle('titleAndIcon'), buttonStyle('glass'), controlSize('mini')]}
            >
              {notificationOptions.map(option => (
                <Button
                  key={option.value}
                  systemImage={option.value === notificationMode ? 'checkmark' : undefined}
                  label={option.label}
                  onPress={() => {
                    Haptic.Light();
                    setNotificationMode(option.value as NotificationMode);
                  }}
                />
              ))}
            </Menu>
          </Host>
        </View>
      </GlassCard>

      <GlassCard style={{ marginBottom: 12 }}>
        <View style={{ paddingVertical: 14, paddingHorizontal: 18, gap: 10 }}>
          <TextArea
            value={notes}
            onChangeText={setNotes}
            placeholder={t('subscription.add_notes_placeholder')}
            placeholderTextColor={colors.textMuted}
            numberOfLines={4}
            style={{
              fontSize: 16,
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
