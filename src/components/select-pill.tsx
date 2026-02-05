import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { Image } from 'expo-image';
import { Select } from 'heroui-native';
import { Text } from 'react-native';

import { useSelectPopoverStyles } from '@/components/select-popover';
import { useTheme } from '@/lib/hooks/use-theme';

export type SelectOption = { label: string; value: string };

type SelectPillProps = {
  value?: SelectOption;
  options: SelectOption[];
  onValueChange: (option?: SelectOption) => void;
  placeholder?: string;
  align?: 'start' | 'center' | 'end';
  width?: 'trigger' | 'content-fit' | 'full' | number;
  size?: 'sm' | 'md';
  variant?: 'default' | 'muted';
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isDisabled?: boolean;
};

export function SelectPill({
  value,
  options,
  onValueChange,
  placeholder = 'Select',
  align = 'start',
  width = 'trigger',
  size = 'md',
  variant = 'default',
  leading,
  style,
  textStyle,
  isDisabled,
}: SelectPillProps) {
  const { colors, isDark } = useTheme();
  const popoverStyles = useSelectPopoverStyles();
  const label = value?.label ?? placeholder;
  const isPlaceholder = !value;

  const sizeStyles = size === 'sm'
    ? {
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 13,
        gap: 6,
        shadow: isDark
          ? '0 12px 20px rgba(0, 0, 0, 0.3)'
          : '0 12px 20px rgba(15, 23, 42, 0.1)',
      }
    : {
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        gap: 6,
        shadow: isDark
          ? '0 16px 28px rgba(0, 0, 0, 0.35)'
          : '0 16px 28px rgba(15, 23, 42, 0.12)',
      };

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      presentation="popover"
      isDisabled={isDisabled}
    >
      <Select.Trigger
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: sizeStyles.gap,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            borderRadius: 999,
            borderCurve: 'continuous',
            backgroundColor: variant === 'muted' ? colors.surfaceMuted : colors.surface,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            boxShadow: sizeStyles.shadow,
          },
          pressed ? { opacity: 0.85 } : null,
          style,
        ]}
      >
        {leading ? leading : null}
        <Text
          style={[
            {
              fontSize: sizeStyles.fontSize,
              fontWeight: '600',
              color: isPlaceholder ? colors.textMuted : colors.text,
            },
            textStyle,
          ]}
          selectable
        >
          {label}
        </Text>
        <Image
          source="sf:chevron.down"
          style={{ width: 12, height: 12 }}
          tintColor={colors.text}
        />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content
          presentation="popover"
          align={align}
          width={width}
          style={popoverStyles.content}
        >
          {options.map(option => (
            <Select.Item key={option.value} value={option.value} label={option.label} />
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
