import type {
  SubscriptionFormInitialState,
  SubscriptionFormPayload,
} from '@/components/subscription-form-content';

import type { ScheduleType } from '@/lib/db/schema';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useToast } from 'heroui-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButtonWithHaptic } from '@/components/back-button-with-haptic';
import { RadialGlow } from '@/components/radial-glow';
import { SubscriptionFormContent } from '@/components/subscription-form-content';
import { Haptic } from '@/lib/haptics';
import { useSubscriptionGlowColor, useTheme } from '@/lib/hooks';
import { useSubscriptionsStore } from '@/lib/stores';

export default function EditSubscriptionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();

  const { subscriptions, update, remove } = useSubscriptionsStore();

  const subscription = useMemo(
    () => subscriptions.find(s => s.id === params.id),
    [subscriptions, params.id],
  );

  const initialState = useMemo<SubscriptionFormInitialState | null>(() => {
    if (!subscription)
      return null;
    return {
      name: subscription.name,
      amount: String(subscription.amount),
      currency: subscription.currency,
      scheduleType: subscription.scheduleType as ScheduleType,
      intervalCount: String(subscription.intervalCount || 1),
      intervalUnit: (subscription.intervalUnit ?? 'month') as 'week' | 'month',
      startDate: subscription.startDate,
      categoryId: subscription.categoryId,
      listId: subscription.listId,
      paymentMethodId: subscription.paymentMethodId ?? '',
      status: subscription.status,
      notificationMode: subscription.notificationMode,
      iconKey: subscription.iconKey ?? 'custom',
      iconUri: subscription.iconUri,
      notes: subscription.notes ?? '',
    };
  }, [subscription]);

  const saveRef = useRef<(() => void) | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const logoColor = useSubscriptionGlowColor(subscription);

  const handleSave = (payload: SubscriptionFormPayload) => {
    if (!subscription)
      return;
    update({ ...subscription, ...payload });
    toast.show(t('subscription.updated'));
    router.back();
  };

  const handleDelete = () => {
    if (!subscription)
      return;

    Alert.alert(
      t('subscription.delete_title'),
      t('subscription.delete_confirm', { name: subscription.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            Haptic.Light();
            remove(subscription.id);
            toast.show(t('subscription.deleted'));
            router.back();
          },
        },
      ],
    );
  };

  // Defer navigation so we don't update navigator state during render (e.g. after delete)
  useEffect(() => {
    if (!subscription || !initialState) {
      Haptic.Light();
      router.back();
    }
  }, [subscription, initialState, router]);

  if (!subscription || !initialState) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('subscription.edit'),
          headerShown: true,
          headerTintColor: colors.text,
          headerLeft: () => <BackButtonWithHaptic displayMode="minimal" />,
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => {
            Haptic.Light();
            handleDelete();
          }}
          icon="trash"
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.View>
          <Button
            variant="outline"
            size="md"
            isDisabled={!isFormValid}
            onPress={() => {
              Haptic.Light();
              saveRef.current?.();
            }}
            style={{ minWidth: 200 }}
          >
            {t('common.save')}
          </Button>
        </Stack.Toolbar.View>
        <Stack.Toolbar.Spacer />
      </Stack.Toolbar>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <RadialGlow color={logoColor} centerY="15%" maxOpacity={0.75} />
        <ScrollView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 120,
          }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <SubscriptionFormContent
            isEdit={true}
            initialState={initialState}
            onSave={handleSave}
            submitRef={saveRef}
            onValidationChange={setIsFormValid}
          />
        </ScrollView>
      </View>
    </>
  );
}
