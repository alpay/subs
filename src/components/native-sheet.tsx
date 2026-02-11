import type { ReactNode } from 'react';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
          className="rounded-full bg-white/5 p-2"
        >
          <Feather name="chevron-left" size={20} color="white" />
        </Pressable>
      )
    : null);

  const resolvedRight = topRight ?? (showCloseIcon
    ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="rounded-full bg-white/5 p-2"
          onPress={handleClose}
        >
          <Feather name="x" size={20} color="white" />
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
            <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
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
