import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { BottomSheetMethods, BottomSheetProps } from '@/shared/ui/templates/bottom-sheet/types';
import { forwardRef, useCallback, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalHeader } from '@/components/modal-header';

import { useTheme } from '@/lib/hooks/use-theme';
import { BottomSheet } from '@/shared/ui/templates/bottom-sheet';

export type SheetShellProps = {
  title: string;
  right?: ReactNode;
  topRightActionBar?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  footerContainerStyle?: StyleProp<ViewStyle>;
  closeVariant?: 'plain' | 'muted';
  closeLabel?: string;
  closeButtonTitle?: string;
  closeSymbol?: string;
  snapPoints?: readonly (number | `${number}%`)[];
  onClose?: () => void;
  bottomScrollSpacer?: number;
  lockSnapPoint?: boolean;
};

export function SheetShell({ ref, title, right, topRightActionBar, children, contentContainerStyle, footer, footerContainerStyle, closeVariant = 'plain', closeLabel, closeButtonTitle, closeSymbol, snapPoints = ['90%'], onClose, bottomScrollSpacer = 74, lockSnapPoint = false }: SheetShellProps & { ref?: React.RefObject<BottomSheetMethods | null> }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const hasFooter = Boolean(footer);
  const resolvedRight = topRightActionBar ?? right;
  const resolvedBottomSpacer = bottomScrollSpacer ?? (hasFooter ? 92 : 74);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const sheetContent = useMemo(
    () => (
      <View style={{ flex: 1 }}>
        <ModalHeader
          title={title}
          right={resolvedRight}
          onClose={handleClose}
          closeVariant={closeVariant}
          closeLabel={closeLabel}
          closeButtonTitle={closeButtonTitle}
          closeSymbol={closeSymbol}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            {
              padding: 20,
              paddingBottom: hasFooter ? insets.bottom + 140 : insets.bottom + 56,
              gap: 16,
              flexGrow: 1,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          bounces={!lockSnapPoint}
        >
          {children}
          <View style={{ height: resolvedBottomSpacer }} />
        </ScrollView>
        {hasFooter && (
          <View
            style={[
              {
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: insets.bottom + 12,
                borderTopWidth: 1,
                borderTopColor: colors.surfaceBorder,
                backgroundColor: colors.surface,
                gap: 12,
              },
              footerContainerStyle,
            ]}
          >
            {footer}
          </View>
        )}
      </View>
    ),
    [
      title,
      resolvedRight,
      handleClose,
      closeVariant,
      closeLabel,
      closeButtonTitle,
      closeSymbol,
      children,
      contentContainerStyle,
      hasFooter,
      insets.bottom,
      resolvedBottomSpacer,
      footer,
      footerContainerStyle,
      colors.surface,
      colors.surfaceBorder,
      lockSnapPoint,
    ],
  );

  const Sheet = BottomSheet as unknown as React.ComponentType<
      BottomSheetProps & { ref?: React.RefObject<BottomSheetMethods | null> }
  >;

  return (
    <Sheet
      ref={ref}
      snapPoints={snapPoints}
      enableBackdrop
      backdropOpacity={0.35}
      dismissOnBackdropPress
      dismissOnSwipeDown={!lockSnapPoint}
      onClose={handleClose}
      enableOverDrag={!lockSnapPoint}
      backgroundColor={colors.surface}
      borderRadius={28}
      sheetStyle={{
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        boxShadow: isDark
          ? '0 -20px 32px rgba(0, 0, 0, 0.42)'
          : '0 -16px 30px rgba(15, 23, 42, 0.12)',
      }}
      handleStyle={{ backgroundColor: colors.textMuted, width: 36, height: 4 }}
    >
      {sheetContent}
    </Sheet>
  );
}

export type { BottomSheetMethods };
