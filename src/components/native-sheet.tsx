import type { ReactNode } from 'react';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NativeSheetProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showCloseIcon?: boolean;
  onClose?: () => void;
};

export function NativeSheet({
  title,
  subtitle,
  children,
  showCloseIcon = true,
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

  return (
    <View className="relative flex-1 bg-black/10 px-4" style={{ paddingBottom: insets.bottom }}>
      {showCloseIcon && (
        <View className="absolute top-0 right-0 flex w-full flex-row items-center justify-end p-4">
          <Pressable className="rounded-full bg-white/5 p-3" onPress={handleClose}>
            <Feather name="x" size={20} color="white" />
          </Pressable>
        </View>
      )}

      <View
        style={{
          paddingTop: 24,
          paddingBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: 'white', textAlign: 'center' }}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
                marginTop: 2,
                textAlign: 'center',
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {children}
      </View>
    </View>
  );
}

