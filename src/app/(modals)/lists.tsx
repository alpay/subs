import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input, Pressable, ScrollView, Text, View } from '@/components/ui';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useListsStore } from '@/lib/stores';

export default function ListsScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { lists, add, remove } = useListsStore();
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
            Lists
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="List name" />
          <Pressable
            onPress={handleAdd}
            className="mt-2 items-center justify-center rounded-2xl py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.headerText }}>
              Add List
            </Text>
          </Pressable>
        </View>

        <View className="mt-6">
          {lists.length === 0 && (
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              No lists yet.
            </Text>
          )}
          {lists.map(list => (
            <View key={list.id} className="mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: colors.card }}>
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                {list.name}
              </Text>
              <Pressable onPress={() => remove(list.id)}>
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
