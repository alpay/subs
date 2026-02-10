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
  topLeft?: ReactNode;
  topRight?: ReactNode;
  onClose?: () => void;
};

export function NativeSheet({
  title,
  subtitle,
  children,
  showCloseIcon = true,
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

  const resolvedRight = topRight ?? (showCloseIcon
    ? (
        <Pressable className="rounded-full bg-white/5 p-3" onPress={handleClose}>
          <Feather name="x" size={20} color="white" />
        </Pressable>
      )
    : null);

  return (
    <View className="relative flex-1 bg-black/10 px-4" style={{ paddingBottom: insets.bottom }}>
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
        <View style={{ minWidth: 48 }}>
          {topLeft}
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title && (
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
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
