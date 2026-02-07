import type {
  BottomSheetBackdropProps,
  BottomSheetModal as BottomSheetModalType,
} from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';

import {
  BottomSheetBackdrop,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';

import { ModalHeader } from './modal-header';

/** 4x4 grid of colors for category picker (mockup). */
export const CATEGORY_PICKER_COLORS: string[] = [
  '#EF4444', '#22C55E', '#EAB308', '#3B82F6',
  '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6',
  '#6B7280', '#EF4444', '#14B8A6', '#1D4ED8',
  '#0D9488', '#EAB308', '#F97316', '#6366F1',
];

const CIRCLE_SIZE = 44;
const GRID_GAP = 16;

type SelectColorSheetProps = {
  sheetRef: RefObject<BottomSheetModalType | null>;
  selectedColor: string;
  onSelect: (color: string) => void;
  onClose?: () => void;
  isVisible: boolean;
};

export function SelectColorSheet({
  sheetRef,
  selectedColor,
  onSelect,
  onClose,
  isVisible,
}: SelectColorSheetProps) {
  const { colors, isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const internalRef = useRef<BottomSheetModalType>(null);
  const ref = sheetRef ?? internalRef;

  const snapPoints = useMemo(() => ['45%'], []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (isVisible) {
        ref.current?.present();
        return;
      }
      ref.current?.dismiss();
    });
    return () => cancelAnimationFrame(frame);
  }, [isVisible, ref]);

  const handleClose = useCallback(() => {
    ref.current?.dismiss();
    onClose?.();
  }, [ref, onClose]);

  const handleDismiss = useCallback(() => {
    onClose?.();
  }, [onClose]);

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

  const handleSelect = useCallback(
    (color: string) => {
      onSelect(color);
      ref.current?.dismiss();
    },
    [onSelect, ref],
  );

  return (
    <GorhomBottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
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
    >
      <ModalHeader title="Select Color" onClose={handleClose} closeVariant="muted" />
      <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: bottom + 24 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: GRID_GAP,
            justifyContent: 'flex-start',
          }}
        >
          {CATEGORY_PICKER_COLORS.map((color) => {
            const isSelected = color.toLowerCase() === selectedColor.toLowerCase();
            return (
              <Pressable
                key={color}
                accessibilityRole="button"
                accessibilityLabel={`Select color ${color}`}
                onPress={() => handleSelect(color)}
                style={({ pressed }) => [
                  {
                    width: CIRCLE_SIZE,
                    height: CIRCLE_SIZE,
                    borderRadius: CIRCLE_SIZE / 2,
                    backgroundColor: color,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: colors.text,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              />
            );
          })}
        </View>
      </BottomSheetView>
    </GorhomBottomSheetModal>
  );
}
