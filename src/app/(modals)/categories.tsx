import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Input, Pressable, ScrollView, Text, View } from '@/components/ui';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore } from '@/lib/stores';

export default function CategoriesScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { categories, add, remove } = useCategoriesStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');

  const handleAdd = () => {
    if (!name.trim()) {
      return;
    }
    add(name.trim(), color);
    setName('');
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
            Categories
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Category name" />
          <Input label="Color" value={color} onChangeText={setColor} placeholder="#RRGGBB" />
          <Pressable
            onPress={handleAdd}
            className="mt-2 items-center justify-center rounded-2xl py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.headerText }}>
              Add Category
            </Text>
          </Pressable>
        </View>

        <View className="mt-6">
          {categories.length === 0 && (
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              No categories yet.
            </Text>
          )}
          {categories.map(cat => (
            <View key={cat.id} className="mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: colors.card }}>
              <View className="flex-row items-center">
                <View className="mr-3 size-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  {cat.name}
                </Text>
              </View>
              <Pressable onPress={() => remove(cat.id)}>
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
