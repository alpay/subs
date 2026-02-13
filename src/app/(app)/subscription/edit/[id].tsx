import type {
  SubscriptionFormInitialState,
  SubscriptionFormPayload,
} from '@/components/subscription-form-content';

import type { ScheduleType } from '@/lib/db/schema';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useToast } from 'heroui-native';
import { useMemo, useRef, useState } from 'react';
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
    toast.show('Subscription updated');
    router.back();
  };

  const handleDelete = () => {
    if (!subscription)
      return;

    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${subscription.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptic.Light();
            remove(subscription.id);
            toast.show('Subscription deleted');
            router.back();
          },
        },
      ],
    );
  };

  if (!subscription || !initialState) {
    Haptic.Light();
    router.back();
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Subscription',
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
            Save
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
