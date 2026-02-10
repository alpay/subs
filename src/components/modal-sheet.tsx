import type {
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import type { ComponentProps, ElementRef, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

import { useTheme } from '@/lib/hooks/use-theme';

import { ModalHeader } from './modal-header';

function BottomSheetOverlayContainer({ children }: { children?: ReactNode }) {
  return (
    <FullWindowOverlay>
      {children}
    </FullWindowOverlay>
  );
}

type ModalSheetProps = {
  title: string;
  right?: ReactNode;
  topRightActionBar?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ComponentProps<typeof BottomSheetScrollView>, 'contentContainerStyle'>;
  footer?: ReactNode;
  footerContainerStyle?: StyleProp<ViewStyle>;
  closeVariant?: 'plain' | 'muted';
  closeIconOnly?: boolean;
  closeLabel?: string;
  closeButtonTitle?: string;
  closeSymbol?: string;
  lockSnapPoint?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
  snapPoints?: (string | number)[];
  /** When true, sheet height follows content height (no fixed snap points). */
  enableDynamicSizing?: boolean;
  stackBehavior?: BottomSheetModalProps['stackBehavior'];
  bottomScrollSpacer?: number;
};

export function ModalSheet({
  title,
  right,
  topRightActionBar,
  children,
  contentContainerStyle,
  scrollViewProps,
  footer,
  footerContainerStyle,
  closeVariant = 'muted',
  closeIconOnly = true,
  closeLabel,
  closeButtonTitle,
  closeSymbol,
  lockSnapPoint = false,
  isVisible = true,
  onClose,
  snapPoints,
  enableDynamicSizing = false,
  stackBehavior = 'push',
  bottomScrollSpacer,
}: ModalSheetProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<ElementRef<typeof BottomSheetModal>>(null);
  const hasFooter = Boolean(footer);

  const resolvedSnapPoints = useMemo(
    () => (enableDynamicSizing ? undefined : (snapPoints ?? ['90%'])),
    [enableDynamicSizing, snapPoints],
  );
  const resolvedRight = topRightActionBar ?? right;
  const resolvedBottomSpacer = bottomScrollSpacer ?? (hasFooter ? 92 : 74);
  const containerComponent = process.env.EXPO_OS === 'web'
    ? undefined
    : BottomSheetOverlayContainer;

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleDismiss = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  }, [onClose, router]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (isVisible) {
        sheetRef.current?.present();
        return;
      }
      sheetRef.current?.dismiss();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isVisible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.35}
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => {
      if (!footer) {
        return null;
      }

      return (
        <BottomSheetFooter {...props}>
          <View
            style={[
              {
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: bottom + 12,
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
        </BottomSheetFooter>
      );
    },
    [bottom, colors.surface, colors.surfaceBorder, footer, footerContainerStyle],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={resolvedSnapPoints}
      onDismiss={handleDismiss}
      stackBehavior={stackBehavior}
      enableDismissOnClose
      enablePanDownToClose
      enableDynamicSizing={enableDynamicSizing}
      enableOverDrag={!lockSnapPoint}
      enableContentPanningGesture={!lockSnapPoint}
      backdropComponent={renderBackdrop}
      footerComponent={hasFooter ? renderFooter : undefined}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        boxShadow: isDark
          ? '0 -20px 32px rgba(0, 0, 0, 0.42)'
          : '0 -16px 30px rgba(15, 23, 42, 0.12)',
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.textMuted,
        width: 36,
        height: 4,
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      containerComponent={containerComponent}
    >
      <View style={{ flex: 1 }}>
        <ModalHeader
          title={title}
          right={resolvedRight}
          onClose={handleClose}
          closeVariant={closeVariant}
          closeIconOnly={closeIconOnly}
          closeLabel={closeLabel}
          closeButtonTitle={closeButtonTitle}
          closeSymbol={closeSymbol}
        />
        <BottomSheetScrollView
          {...scrollViewProps}
          style={[{ flex: 1 }, scrollViewProps?.style]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            {
              padding: 20,
              paddingBottom: hasFooter ? bottom + 140 : bottom + 56,
              gap: 16,
              flexGrow: 1,
            },
            contentContainerStyle,
          ]}
        >
          {children}
          <View style={{ height: resolvedBottomSpacer }} />
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
