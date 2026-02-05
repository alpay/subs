import type { ReactNode } from 'react';

import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type ModalHeaderProps = {
  title: string;
  right?: ReactNode;
  onClose?: () => void;
  closeVariant?: 'plain' | 'muted';
};

export function ModalHeader({ title, right, onClose, closeVariant = 'plain' }: ModalHeaderProps) {
  const { colors } = useTheme();
  const isMuted = closeVariant === 'muted';

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
          {title}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {right}
        {onClose
          ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={onClose}
                style={({ pressed }) => [
                  {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isMuted ? colors.surfaceMuted : 'transparent',
                    borderWidth: isMuted ? 1 : 0,
                    borderColor: isMuted ? colors.surfaceBorder : 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Image
                  source="sf:xmark"
                  style={{ width: 12, height: 12 }}
                  tintColor={colors.text}
                />
              </Pressable>
            )
          : null}
      </View>
    </View>
  );
}
