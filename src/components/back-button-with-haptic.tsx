import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';

type BackButtonWithHapticProps = {
  /** When 'minimal', only chevron is shown. Otherwise show title next to chevron. */
  displayMode?: 'minimal' | 'default';
  /** Back button title (e.g. "Back"). Ignored when displayMode is 'minimal'. */
  title?: string;
};

/**
 * Header back button that triggers haptic (iOS) then navigates back.
 * Use in Stack.Screen options.headerLeft so the native back tap also has haptics.
 */
export function BackButtonWithHaptic({
  displayMode = 'minimal',
  title,
}: BackButtonWithHapticProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const label = title ?? t('common.accessibility.back_label');

  const handlePress = () => {
    Haptic.Light();
    router.back();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
    >
      <Image
        source="sf:chevron.left"
        style={{ width: 22, height: 22 }}
        tintColor={colors.text}
      />
      {displayMode !== 'minimal' && (
        <Text
          style={{
            marginLeft: 2,
            fontSize: 17,
            color: colors.text,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
