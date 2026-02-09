import type { SubscriptionFormInitialState, SubscriptionFormPayload } from '@/components/subscription-form-content';

import type { ScheduleType } from '@/lib/db/schema';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useToast } from 'heroui-native';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionFormContent } from '@/components/subscription-form-content';
import { useTheme } from '@/lib/hooks/use-theme';
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
      notes: subscription.notes ?? '',
    };
  }, [subscription]);

  const saveRef = useRef<(() => void) | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

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
          headerStyle: { backgroundColor: colors.background },
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
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 32,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SubscriptionFormContent
          isEdit={true}
          initialState={initialState}
          onSave={handleSave}
          submitRef={saveRef}
          onValidationChange={setIsFormValid}
          renderFooter={({ isValid, onSave }) => (
            <View style={{ paddingTop: 16, paddingBottom: 8 }}>
              <Button
                variant="primary"
                size="lg"
                isDisabled={!isValid}
                onPress={onSave}
                style={{ width: '100%' }}
              >
                Save
              </Button>
            </View>
          )}
        />
      </ScrollView>
    </>
  );
}
