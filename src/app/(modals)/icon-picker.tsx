import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Button, Chip, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalSheet } from '@/components/modal-sheet';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useServiceTemplatesStore } from '@/lib/stores';

export default function IconPickerScreen() {
  useBootstrap();
  const { toast } = useToast();
  const { colors } = useTheme();
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
    <ModalSheet title="Icon Picker">
      <GlassCard>
        <GlassCardBody style={{ gap: 8 }}>
          <Text style={{ color: colors.textMuted }} selectable>
            Use an icon key or upload a custom image.
          </Text>
          <Button variant="secondary" onPress={handlePickImage}>
            Pick image from library
          </Button>

          {imageUri && (
            <View style={{ alignItems: 'flex-start', gap: 8 }}>
              <Image source={{ uri: imageUri }} style={{ width: 72, height: 72, borderRadius: 16 }} />
              <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                {imageUri}
              </Text>
            </View>
          )}
        </GlassCardBody>
      </GlassCard>

      <GlassCard>
        <GlassCardBody style={{ gap: 10 }}>
          <Text style={{ fontSize: 13, color: colors.textMuted }} selectable>
            Available icon keys
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {iconKeys.map(iconKey => (
              <Chip key={iconKey}>{iconKey}</Chip>
            ))}
          </View>
        </GlassCardBody>
      </GlassCard>
    </ModalSheet>
  );
}
