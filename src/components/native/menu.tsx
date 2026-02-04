import type { SFSymbol } from 'sf-symbols-typescript';
import type { OptionType } from '@/components/ui/select';
import { Host, HStack, Button as SwiftButton, Image as SwiftImage, Menu as SwiftMenu, Text as SwiftText } from '@expo/ui/swift-ui';
import { buttonStyle, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import { useMemo } from 'react';

import { Select } from '@/components/ui/select';

type MenuProps = {
  value?: string | number;
  options?: OptionType[];
  onSelect?: (value: string | number) => void;
  placeholder?: string;
  systemImage?: SFSymbol;
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  testID?: string;
};

export function Menu({
  value,
  options = [],
  onSelect,
  placeholder = 'Select',
  systemImage,
  iconPosition = 'start',
  disabled = false,
  testID,
}: MenuProps) {
  const selectedLabel = useMemo(
    () => options.find(option => option.value === value)?.label ?? placeholder,
    [options, placeholder, value],
  );
  const isSwiftUIMenuSupported = process.env.EXPO_OS === 'ios' || process.env.EXPO_OS === 'tvos';

  if (!isSwiftUIMenuSupported) {
    return (
      <Select
        value={value}
        options={options}
        onSelect={onSelect}
        placeholder={placeholder}
        disabled={disabled}
        testID={testID}
      />
    );
  }

  const menuLabel = iconPosition === 'end' && systemImage
    ? (
        <HStack spacing={6}>
          <SwiftText>{selectedLabel}</SwiftText>
          <SwiftImage systemName={systemImage} size={12} />
        </HStack>
      )
    : selectedLabel;

  return (
    <Host matchContents>
      <SwiftMenu
        label={menuLabel}
        systemImage={iconPosition === 'start' ? systemImage : undefined}
        modifiers={[
          buttonStyle('bordered'),
          disabledModifier(disabled),
        ]}
      >
        {options.map(option => (
          <SwiftButton
            key={String(option.value)}
            label={option.label}
            onPress={() => onSelect?.(option.value)}
            systemImage={option.value === value ? 'checkmark' : undefined}
          />
        ))}
      </SwiftMenu>
    </Host>
  );
}
