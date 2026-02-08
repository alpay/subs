import type { ReactNode } from 'react';

import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type ModalHeaderProps = {
  title: string;
  right?: ReactNode;
  topRightActionBar?: ReactNode;
  onClose?: () => void;
  closeVariant?: 'plain' | 'muted';
  /** When true, only the close icon is shown (no text). Default true. */
  closeIconOnly?: boolean;
  closeLabel?: string;
  closeButtonTitle?: string;
  closeSymbol?: string;
};

export function ModalHeader({
  title,
  right,
  topRightActionBar,
  onClose,
  closeVariant = 'plain',
  closeIconOnly = true,
  closeLabel,
  closeButtonTitle,
  closeSymbol,
}: ModalHeaderProps) {
  const { colors } = useTheme();
  const isMuted = closeVariant === 'muted';
  const resolvedCloseLabel = closeButtonTitle ?? closeLabel ?? 'Close';
  const normalizedCloseLabel = resolvedCloseLabel.trim().toLowerCase();
  const useDismissSymbol = normalizedCloseLabel === 'cancel'
    || normalizedCloseLabel === 'close'
    || normalizedCloseLabel === 'done';
  const resolvedCloseSymbol = closeSymbol ?? (useDismissSymbol ? 'xmark' : 'chevron.left');
  const resolvedRight = topRightActionBar ?? right;
  const rightContent = typeof resolvedRight === 'string' || typeof resolvedRight === 'number'
    ? (
        <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }} selectable>
          {resolvedRight}
        </Text>
      )
    : resolvedRight;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ minWidth: 88, maxWidth: '40%', alignItems: 'flex-start' }}>
          {onClose
            ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={resolvedCloseLabel}
                  hitSlop={10}
                  onPress={onClose}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 8,
                      paddingHorizontal: closeIconOnly ? 8 : 4,
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
                    tintColor={colors.text}
                  />
                  {!closeIconOnly && (
                    <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 14 }} selectable>
                      {resolvedCloseLabel}
                    </Text>
                  )}
                </Pressable>
              )
            : null}
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 10 }}>
          <Text numberOfLines={1} style={{ color: colors.text, fontWeight: '600', fontSize: 16 }} selectable>
            {title}
          </Text>
        </View>
        <View style={{ minWidth: 88, maxWidth: '45%', alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {rightContent}
          </View>
        </View>
      </View>
    </View>
  );
}
