import type {
  SubscriptionFormInitialState,
  SubscriptionFormPayload,
} from '@/components/subscription-form-content';
import type { NotificationMode, ScheduleType } from '@/lib/db/schema';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useToast } from 'heroui-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButtonWithHaptic } from '@/components/back-button-with-haptic';
import { RadialGlow } from '@/components/radial-glow';
import { getServiceColor } from '@/components/service-icon';
import { SubscriptionFormContent } from '@/components/subscription-form-content';
import { Haptic } from '@/lib/haptics';
import { usePremiumGuard } from '@/lib/hooks/use-premium-guard';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  useCategoriesStore,
  useListsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { canAdd, countLabel, isPremium, showPaywall } = usePremiumGuard();
  const params = useLocalSearchParams<{ templateId?: string; name?: string; iconKey?: string; iconUri?: string }>();

  const paramName = typeof params.name === 'string' ? params.name : params.name?.[0];
  const paramIconKey = typeof params.iconKey === 'string' ? params.iconKey : params.iconKey?.[0];
  const paramIconUri = typeof params.iconUri === 'string' ? params.iconUri : params.iconUri?.[0];

  const { add } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { templates } = useServiceTemplatesStore();
  const { settings } = useSettingsStore();

  const selectedTemplate = useMemo(
    () => (params.templateId ? templates.find(t => t.id === params.templateId) : undefined),
    [params.templateId, templates],
  );

  const initialState = useMemo<SubscriptionFormInitialState>(
    () => ({
      name: selectedTemplate?.name ?? paramName ?? '',
      amount: '',
      currency: settings.mainCurrency,
      scheduleType: (selectedTemplate?.defaultScheduleType ?? 'monthly') as ScheduleType,
      intervalCount: '1',
      intervalUnit: 'month',
      startDate: todayIsoDate(),
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
      settings.mainCurrency,
      categories,
      lists,
    ],
  );

  const saveRef = useRef<(() => void) | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (!canAdd) {
      router.replace('/(app)/paywall');
    }
  }, [canAdd, router]);

  const handleSave = (payload: SubscriptionFormPayload) => {
    if (!canAdd) {
      showPaywall();
      return;
    }
    add(payload);
    toast.show('Subscription created');
    Haptic.Light();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Subscription',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
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
          color={getServiceColor(initialState.iconKey)}
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
