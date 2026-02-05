import type { ReactNode } from 'react';

import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type ModalHeaderProps = {
  title: string;
  right?: ReactNode;
  onClose?: () => void;
  closeVariant?: 'plain' | 'muted';
  closeLabel?: string;
  closeSymbol?: string;
};

export function ModalHeader({
  title,
  right,
  onClose,
  closeVariant = 'plain',
  closeLabel = 'Back',
  closeSymbol,
}: ModalHeaderProps) {
  const { colors } = useTheme();
  const isMuted = closeVariant === 'muted';
  const resolvedCloseSymbol = closeSymbol ?? (closeLabel.toLowerCase() === 'cancel' ? 'xmark' : 'chevron.left');
  const rightContent = typeof right === 'string' || typeof right === 'number'
    ? (
        <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }} selectable>
          {right}
        </Text>
      )
    : right;

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ minWidth: 80, alignItems: 'flex-start' }}>
          {onClose
            ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={onClose}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingVertical: 6,
                      paddingHorizontal: 4,
                      borderRadius: 999,
                      borderCurve: 'continuous',
                      backgroundColor: isMuted ? colors.surfaceMuted : 'transparent',
                      borderWidth: isMuted ? 1 : 0,
                      borderColor: isMuted ? colors.surfaceBorder : 'transparent',
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Image
                    source={`sf:${resolvedCloseSymbol}`}
                    style={{ width: 14, height: 14 }}
                    tintColor={colors.accent}
                  />
                  <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 14 }} selectable>
                    {closeLabel}
                  </Text>
                </Pressable>
              )
            : null}
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }} selectable>
            {title}
          </Text>
        </View>
        <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
          {rightContent}
        </View>
      </View>
    </View>
  );
}
