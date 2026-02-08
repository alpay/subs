import type { ReactNode } from 'react';

import { Dialog } from 'heroui-native';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type AppDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** Optional style for the content box (e.g. minWidth). */
  contentStyle?: object;
};

/**
 * Centered, themed dialog for the app. Use for confirmations, renames, etc.
 * Renders horizontally and vertically centered with app theme (surface, border).
 */
export function AppDialog({
  isOpen,
  onOpenChange,
  title,
  children,
  contentStyle,
}: AppDialogProps) {
  const { colors, isDark } = useTheme();

  const contentBoxStyle = useMemo(
    () => ({
      width: '100%' as const,
      maxWidth: 320,
      minWidth: 280,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderCurve: 'continuous' as const,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      padding: 20,
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: 24,
      elevation: 8,
      ...contentStyle,
    }),
    [colors.surface, colors.surfaceBorder, contentStyle, isDark],
  );

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal
        style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }]}
      >
        <Dialog.Overlay />
        <View
          style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }]}
          pointerEvents="box-none"
        >
          <View style={contentBoxStyle} pointerEvents="auto">
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}
              selectable
            >
              {title}
            </Text>
            {children}
          </View>
        </View>
      </Dialog.Portal>
    </Dialog>
  );
}
