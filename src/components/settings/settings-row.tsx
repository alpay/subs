import type { ReactNode } from 'react';
import { SwiftUI } from '@mgcrea/react-native-swiftui';

import { withHaptic } from '@/lib/haptics';

const ICON_SIZE = 22;

type SettingsRowProps = {
  icon: string;
  label: string | ReactNode;
  value?: string | ReactNode;
  valueColor?: string;
  trailingIcon?: 'chevron' | 'arrow' | false;
  buttonColor?: string;
  onPress: () => void;
};

export function SettingsRow({
  icon,
  label,
  value,
  valueColor,
  trailingIcon = 'chevron',
  buttonColor,
  onPress,
}: SettingsRowProps) {
  const iconName = icon.startsWith('system:') ? icon : `system:${icon}`;
  const trailingIconName = trailingIcon === 'chevron' ? 'system:chevron.right' : 'system:arrow.up.right';
  const handlePress = withHaptic(onPress);

  return (
    <SwiftUI.Button
      buttonStyle="default"
      style={{ color: buttonColor }}
      onPress={handlePress}
    >
      <SwiftUI.HStack spacing={8}>
        <SwiftUI.Image name={iconName} style={{ width: ICON_SIZE, height: ICON_SIZE }} />
        {typeof label === 'string' ? <SwiftUI.Text text={label} /> : label}
        <SwiftUI.Spacer />
        {value != null && (
          typeof value === 'string'
            ? <SwiftUI.Text text={value} style={valueColor ? { color: valueColor } : undefined} />
            : value
        )}
        {trailingIcon !== false && <SwiftUI.Image name={trailingIconName} />}
      </SwiftUI.HStack>
    </SwiftUI.Button>
  );
}

type SettingsToggleRowProps = {
  icon: string;
  label: string;
  isOn: boolean;
  onChange: (value: boolean) => void;
};

export function SettingsToggleRow({
  icon,
  label,
  isOn,
  onChange,
}: SettingsToggleRowProps) {
  const iconName = icon.startsWith('system:') ? icon : `system:${icon}`;

  return (
    <SwiftUI.HStack spacing={8}>
      <SwiftUI.Image name={iconName} style={{ width: ICON_SIZE, height: ICON_SIZE }} />
      <SwiftUI.Text text={label} />
      <SwiftUI.Spacer />
      <SwiftUI.Toggle
        label=""
        isOn={isOn}
        onChange={onChange}
      />
    </SwiftUI.HStack>
  );
}
