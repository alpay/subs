import type {
  SubscriptionFormInitialState,
  SubscriptionFormPayload,
} from '@/components/subscription-form-content';
import type { NotificationMode, ScheduleType, Subscription } from '@/lib/db/schema';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { Button, useToast } from 'heroui-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButtonWithHaptic } from '@/components/back-button-with-haptic';
import { RadialGlow } from '@/components/radial-glow';
import { SubscriptionFormContent } from '@/components/subscription-form-content';
import { Haptic } from '@/lib/haptics';
import { usePremiumGuard } from '@/lib/hooks/use-premium-guard';
import { useSubscriptionGlowColor } from '@/lib/hooks/use-subscription-glow-color';
import { useTheme } from '@/lib/hooks/use-theme';
import { getItem, setItem } from '@/lib/storage';
import {
  useCategoriesStore,
  useListsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';
import { toLocalDateString } from '@/lib/utils/subscription-dates';

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { canAdd, countLabel, isPremium, limit, showPaywall } = usePremiumGuard();
  const params = useLocalSearchParams<{
    templateId?: string;
    name?: string;
    iconKey?: string;
    iconUri?: string;
    startDate?: string;
  }>();

  const paramName = typeof params.name === 'string' ? params.name : params.name?.[0];
  const paramIconKey = typeof params.iconKey === 'string' ? params.iconKey : params.iconKey?.[0];
  const paramIconUri = typeof params.iconUri === 'string' ? params.iconUri : params.iconUri?.[0];
  const paramStartDate = typeof params.startDate === 'string' ? params.startDate : params.startDate?.[0];
  const startDate = paramStartDate?.length === 10 && !Number.isNaN(Date.parse(paramStartDate))
    ? paramStartDate
    : toLocalDateString(new Date());

  const { add } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { templates } = useServiceTemplatesStore();
  const { settings } = useSettingsStore();

  const selectedTemplate = useMemo(
    () => (params.templateId ? templates.find(t => t.id === params.templateId) : undefined),
    [params.templateId, templates],
  );

  const glowSubscription = useMemo(
    () => (paramIconUri?.trim()
      ? {
          iconKey: paramIconKey ?? 'custom',
          iconType: 'image' as const,
          iconUri: paramIconUri.trim(),
          id: '',
        }
      : {
          iconKey: paramIconKey ?? 'custom',
          iconType: 'builtIn' as const,
          iconUri: undefined,
          id: '',
        }),
    [paramIconKey, paramIconUri],
  );
  const glowColor = useSubscriptionGlowColor(glowSubscription as Subscription);

  const initialState = useMemo<SubscriptionFormInitialState>(
    () => ({
      name: selectedTemplate?.name ?? paramName ?? '',
      amount: '',
      currency: settings.mainCurrency,
      scheduleType: (selectedTemplate?.defaultScheduleType ?? 'monthly') as ScheduleType,
      intervalCount: '1',
      intervalUnit: 'month',
      startDate,
      categoryId: selectedTemplate?.defaultCategoryId ?? categories[0]?.id ?? '',
      listId: lists[0]?.id ?? '',
      paymentMethodId: '',
      status: 'active',
      notificationMode: 'default' as NotificationMode,
      iconKey: selectedTemplate?.iconKey ?? paramIconKey ?? 'custom',
      iconUri: paramIconUri,
      notes: '',
    }),
    [
      selectedTemplate,
      paramName,
      paramIconKey,
      paramIconUri,
      startDate,
      settings.mainCurrency,
      categories,
      lists,
    ],
  );

  const saveRef = useRef<(() => void) | null>(null);
  const justSavedAtLimitRef = useRef(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (!canAdd && !justSavedAtLimitRef.current) {
      router.replace('/(app)/paywall');
    }
    justSavedAtLimitRef.current = false;
  }, [canAdd, router]);

  const handleSave = async (payload: SubscriptionFormPayload) => {
    if (!canAdd) {
      showPaywall();
      return;
    }
    const subscriptionCountBefore = useSubscriptionsStore.getState().subscriptions.length;
    add(payload);
    toast.show('Subscription created');
    Haptic.Success();

    // Ask for review once after first subscription
    if (subscriptionCountBefore === 0) {
      const alreadyAsked = getItem<boolean>('reviewAskedAfterFirstSubscription');
      if (!alreadyAsked) {
        const canReview = await StoreReview.hasAction();
        if (canReview) {
          await StoreReview.requestReview();
          await setItem('reviewAskedAfterFirstSubscription', true);
        }
      }
    }

    // If we just hit the free limit, show paywall instead of home to avoid
    // navigation race with the useEffect that redirects when !canAdd.
    const atLimit = !isPremium && subscriptionCountBefore + 1 >= limit;
    if (atLimit) {
      justSavedAtLimitRef.current = true;
      router.dismissTo('/(app)/home');
      router.push('/(app)/paywall');
    }
    else {
      router.dismissTo('/(app)/home');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Subscription',
          headerShown: true,
          headerTintColor: colors.text,

          headerLeft: () => <BackButtonWithHaptic displayMode="minimal" />,
          headerRight: () => (isPremium
            ? undefined
            : (
                <Pressable
                  onPress={() => {
                    Haptic.Light();
                    showPaywall();
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    {countLabel}
                  </Text>
                </Pressable>
              )),
        }}
      />
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
            Create
          </Button>
        </Stack.Toolbar.View>
        <Stack.Toolbar.Spacer />
      </Stack.Toolbar>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <RadialGlow
          color={glowColor}
          centerY="15%"
          maxOpacity={0.75}
        />
        <ScrollView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 120,
          }}
          contentInsetAdjustmentBehavior="automatic"
        >
          <SubscriptionFormContent
            isEdit={false}
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
