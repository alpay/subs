import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceIcon from '@/components/subscriptions/service-icon';
import { Image, Pressable, ScrollView, Text, View } from '@/components/ui';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useServiceTemplatesStore } from '@/lib/stores';

export default function IconPickerScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { templates } = useServiceTemplatesStore();
  const { top } = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) {
      return;
    }
    setImageUri(result.assets[0].uri);
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
            Icon Picker
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text className="mt-6 text-sm" style={{ color: colors.secondaryText }}>
          Pick a built-in icon or select an image from your library.
        </Text>
        <Pressable
          onPress={handlePickImage}
          className="mt-4 items-center justify-center rounded-2xl px-4 py-3"
          style={{ backgroundColor: colors.card }}
        >
          <Text className="text-sm" style={{ color: colors.text }}>
            Pick Image
          </Text>
        </Pressable>
        {imageUri && (
          <View className="mt-4 items-center">
            <Image source={{ uri: imageUri }} className="size-20 rounded-2xl" />
          </View>
        )}
        <View className="mt-4 flex-row flex-wrap">
          {templates.map(template => (
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
