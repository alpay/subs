import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Button, Card, Chip, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useServiceTemplatesStore } from '@/lib/stores';

export default function IconPickerScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { top, bottom } = useSafeAreaInsets();
  const { templates } = useServiceTemplatesStore();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const iconKeys = useMemo(() => {
    const unique = new Set(templates.map(template => template.iconKey));
    return [...unique].sort();
  }, [templates]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show('Photo permission is required to pick an image');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    setImageUri(result.assets[0].uri);
  };

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Icon Picker</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Body style={{ gap: 8 }}>
            <Text style={{ opacity: 0.7 }}>
              HeroUI migration removed old icon components. Use an icon key or custom image URI.
            </Text>
            <Button variant="secondary" onPress={handlePickImage}>
              Pick image from library
            </Button>

            {imageUri && (
              <View style={{ alignItems: 'flex-start', gap: 8 }}>
                <Image source={{ uri: imageUri }} style={{ width: 72, height: 72, borderRadius: 16 }} />
                <Text style={{ fontSize: 12, opacity: 0.7 }} selectable>
                  {imageUri}
                </Text>
              </View>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Available icon keys</Card.Title>
          </Card.Header>
          <Card.Body style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {iconKeys.map(iconKey => (
              <Chip key={iconKey}>{iconKey}</Chip>
            ))}
          </Card.Body>
        </Card>
      </ScrollView>
    </View>
  );
}
