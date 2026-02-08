import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

/** 4x5 grid of colors for category picker (mockup + extra options). */
export const CATEGORY_PICKER_COLORS: string[] = [
  '#EF4444', '#22C55E', '#EAB308', '#3B82F6',
  '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6',
  '#6B7280', '#14B8A6', '#1D4ED8', '#0D9488',
  '#F97316', '#6366F1', '#84CC16', '#F43F5E',
  '#7C3AED', '#0F766E', '#64748B', '#E11D48',
];

const CIRCLE_SIZE = 44;
const GRID_GAP = 16;

/** Content only – use inside ModalSheet for gorhom stack (see categories screen). */
export function SelectColorContent({
  selectedColor,
  onSelect,
}: {
  selectedColor: string;
  onSelect: (color: string) => void;
}) {
  const { colors } = useTheme();

  const handleSelect = useCallback(
    (color: string) => {
      onSelect(color);
    },
    [onSelect],
  );

  return (
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
  );
}
