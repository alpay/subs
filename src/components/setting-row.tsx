import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type SettingRowProps = {
  label: string;
  value?: string;
  description?: string;
  children?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SettingRow({ label, value, description, children, onPress, style }: SettingRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable disabled={!onPress} onPress={onPress} style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: colors.text, fontWeight: '500' }} selectable>
            {label}
          </Text>
          {description
            ? (
                <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                  {description}
                </Text>
              )
            : null}
        </View>
        {value
          ? (
              <Text style={{ color: colors.textMuted }} selectable>
                {value}
              </Text>
            )
          : null}
        {children}
      </View>
    </Pressable>
  );
}
