import type { SubscriptionFormInitialState, SubscriptionFormPayload } from '@/components/subscription-form-content';

import type { ScheduleType } from '@/lib/db/schema';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useToast } from 'heroui-native';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RadialGlow } from '@/components/radial-glow';
import { SubscriptionFormContent } from '@/components/subscription-form-content';
import { useSubscriptionGlowColor, useTheme } from '@/lib/hooks';
import { useSubscriptionsStore } from '@/lib/stores';

export default function EditSubscriptionScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();

  const { subscriptions, update } = useSubscriptionsStore();

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
    toast.show('Subscription updated');
    router.back();
  };

  if (!subscription || !initialState) {
    router.back();
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Subscription',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen.BackButton displayMode="minimal" />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => saveRef.current?.()}
          disabled={!isFormValid}
        >
          Save
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <RadialGlow color={logoColor} centerY="15%" maxOpacity={0.75} />
        <ScrollView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 340 + insets.bottom,
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
            renderFooter={() => null}
          />
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.surfaceBorder,
          }}
        >
          <Button
            variant="primary"
            size="lg"
            isDisabled={!isFormValid}
            onPress={() => saveRef.current?.()}
            style={{ width: '100%' }}
          >
            Save
          </Button>
        </View>
      </View>
    </>
  );
}
