import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input, Pressable, ScrollView, Text, View } from '@/components/ui';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { usePaymentMethodsStore } from '@/lib/stores';

export default function PaymentMethodsScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { methods, add, remove } = usePaymentMethodsStore();
  const { top } = useSafeAreaInsets();
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) {
      return;
    }
    add(name.trim());
    setName('');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background, paddingTop: top }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Close
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Payment Methods
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Payment method" />
          <Pressable
            onPress={handleAdd}
            className="mt-2 items-center justify-center rounded-2xl py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.headerText }}>
              Add Method
            </Text>
          </Pressable>
          <Text className="mt-3 text-xs" style={{ color: colors.secondaryText }}>
            We care about your security, please do not store full card numbers.
          </Text>
        </View>

        <View className="mt-6">
          {methods.length === 0 && (
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              No payment methods yet.
            </Text>
          )}
          {methods.map(method => (
            <View key={method.id} className="mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: colors.card }}>
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                {method.name}
              </Text>
              <Pressable onPress={() => remove(method.id)}>
                <Text className="text-xs" style={{ color: colors.secondaryText }}>
                  Remove
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
