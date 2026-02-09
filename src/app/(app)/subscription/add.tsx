import type {
  SubscriptionFormInitialState,
  SubscriptionFormPayload,
} from '@/components/subscription-form-content';
import type { NotificationMode, ScheduleType } from '@/lib/db/schema';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useToast } from 'heroui-native';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionFormContent } from '@/components/subscription-form-content';
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

  const handleSave = (payload: SubscriptionFormPayload) => {
    add(payload);
    toast.show('Subscription created');
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Subscription',
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
          Create
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
          isEdit={false}
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
                Create
              </Button>
            </View>
          )}
        />
      </ScrollView>
    </>
  );
}
