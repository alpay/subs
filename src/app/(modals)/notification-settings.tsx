import { useState } from 'react';
import { useRouter } from 'expo-router';

import { Input, Pressable, ScrollView, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useSettingsStore } from '@/lib/stores';

export default function NotificationSettingsScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { settings, update } = useSettingsStore();

  const [firstDays, setFirstDays] = useState(String(settings.notificationDefaults.first.daysBefore));
  const [firstTime, setFirstTime] = useState(settings.notificationDefaults.first.time);
  const [secondDays, setSecondDays] = useState(settings.notificationDefaults.second?.daysBefore?.toString() ?? '');
  const [secondTime, setSecondTime] = useState(settings.notificationDefaults.second?.time ?? '');

  const handleSave = () => {
    update({
      notificationDefaults: {
        first: {
          daysBefore: Number(firstDays) || 0,
          time: firstTime || '09:00',
        },
        second: secondDays
          ? {
              daysBefore: Number(secondDays) || 0,
              time: secondTime || '09:00',
            }
          : null,
      },
    });
    router.back();
  };

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
            Notifications
          </Text>
          <Pressable onPress={handleSave}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Save
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 rounded-3xl px-4 py-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>
            First Reminder
          </Text>
          <Input label="Days before" value={firstDays} onChangeText={setFirstDays} keyboardType="number-pad" />
          <Input label="Time" value={firstTime} onChangeText={setFirstTime} placeholder="09:00" />
        </View>

        <View className="mt-4 rounded-3xl px-4 py-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>
            Second Reminder (optional)
          </Text>
          <Input label="Days before" value={secondDays} onChangeText={setSecondDays} keyboardType="number-pad" />
          <Input label="Time" value={secondTime} onChangeText={setSecondTime} placeholder="09:00" />
        </View>
      </ScrollView>
    </View>
  );
}
