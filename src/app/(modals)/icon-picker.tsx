import { useRouter } from 'expo-router';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useServiceTemplatesStore } from '@/lib/stores';
import ServiceIcon from '@/components/subscriptions/service-icon';

export default function IconPickerScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { templates } = useServiceTemplatesStore();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Close
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Icon Picker
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text className="mt-6 text-sm" style={{ color: colors.secondaryText }}>
          Pick a built-in icon (image picker integration will be wired in Phase 4).
        </Text>
        <View className="mt-4 flex-row flex-wrap">
          {templates.map((template) => (
            <View key={template.id} className="mb-4 w-1/3 items-center">
              <View className="rounded-2xl p-3" style={{ backgroundColor: colors.card }}>
                <ServiceIcon iconKey={template.iconKey} />
              </View>
              <Text className="mt-2 text-xs" style={{ color: colors.text }}>
                {template.name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
