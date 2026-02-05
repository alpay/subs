import type {
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
  BottomSheetMethods,
  BottomSheetScrollViewProps,
} from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';

import { ModalHeader } from './modal-header';

type ModalSheetProps = {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<BottomSheetScrollViewProps, 'contentContainerStyle'>;
  footer?: ReactNode;
  footerContainerStyle?: StyleProp<ViewStyle>;
  closeVariant?: 'plain' | 'muted';
  closeLabel?: string;
  closeSymbol?: string;
  lockSnapPoint?: boolean;
};

export function ModalSheet({
  title,
  right,
  children,
  contentContainerStyle,
  scrollViewProps,
  footer,
  footerContainerStyle,
  closeVariant = 'plain',
  closeLabel,
  closeSymbol,
  lockSnapPoint = false,
}: ModalSheetProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const hasFooter = Boolean(footer);

  const snapPoints = useMemo(() => ['90%'], []);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        router.back();
      }
    },
    [router],
  );

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
  }, []);

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
                backgroundColor: colors.background,
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
    [bottom, colors.background, colors.surfaceBorder, footer, footerContainerStyle],
  );

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enablePanDownToClose
        enableDynamicSizing={false}
        enableOverDrag={!lockSnapPoint}
        enableContentPanningGesture={!lockSnapPoint}
        backdropComponent={renderBackdrop}
        footerComponent={hasFooter ? renderFooter : undefined}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{
          backgroundColor: colors.surfaceBorder,
          width: 40,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <View style={{ flex: 1 }}>
          <ModalHeader
            title={title}
            right={right}
            onClose={handleClose}
            closeVariant={closeVariant}
            closeLabel={closeLabel}
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
                paddingBottom: hasFooter ? bottom + 120 : bottom + 40,
                gap: 16,
              },
              contentContainerStyle,
            ]}
          >
            {children}
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}
