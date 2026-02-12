import type { ReactNode } from 'react';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';

type NativeSheetProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  showCloseIcon?: boolean;
  showBackIcon?: boolean;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  onClose?: () => void;
};

export function NativeSheet({
  title,
  subtitle,
  children,
  showCloseIcon = true,
  showBackIcon = false,
  topLeft,
  topRight,
  onClose,
}: NativeSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const resolvedLeft = topLeft ?? (showBackIcon
    ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={handleClose}
          style={{ borderRadius: 9999, backgroundColor: colors.surfaceMuted, padding: 8 }}
        >
          <Feather name="chevron-left" size={20} color={colors.text} />
        </Pressable>
      )
    : null);

  const resolvedRight = topRight ?? (showCloseIcon
    ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{ borderRadius: 9999, backgroundColor: colors.surfaceMuted, padding: 8 }}
          onPress={handleClose}
        >
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
      )
    : null);

  return (
    <View className="relative flex-1 px-4" style={{ paddingBottom: insets.bottom }}>
      <View
        // Mark header as non-collapsable so React Native Screens can
        // correctly treat it as the fixed header when used with a ScrollView
        // in a FormSheet presentation.
        collapsable={false}
        style={{
          paddingTop: 16,
          paddingBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ minWidth: 48, alignItems: 'flex-start' }}>
          {resolvedLeft}
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title && (
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View style={{ minWidth: 48, alignItems: 'flex-end' }}>
          {resolvedRight}
        </View>
      </View>

      <View
        // Mark header as non-collapsable so React Native Screens can
        // correctly treat it as the fixed header when used with a ScrollView
        // in a FormSheet presentation.
        collapsable={false}
        style={{ gap: 8 }}
      >
        {children}
      </View>
    </View>
  );
}
