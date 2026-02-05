import type {
  BottomSheetBackdropProps,
  BottomSheetMethods,
  BottomSheetScrollViewProps,
} from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import BottomSheet, {
  BottomSheetBackdrop,
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
};

export function ModalSheet({
  title,
  right,
  children,
  contentContainerStyle,
  scrollViewProps,
}: ModalSheetProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetMethods>(null);

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

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{
          backgroundColor: colors.surfaceBorder,
          width: 40,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <ModalHeader title={title} right={right} onClose={handleClose} />
        <BottomSheetScrollView
          {...scrollViewProps}
          style={[{ flex: 1 }, scrollViewProps?.style]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            {
              padding: 20,
              paddingBottom: bottom + 40,
              gap: 16,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
