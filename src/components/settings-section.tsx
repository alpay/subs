import type { ComponentProps, ReactNode } from 'react';

import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

/** Rounded panel with a slightly elevated background for grouping settings (mockup style). */
export function SettingsSection({
  children,
  style,
}: {
  children: ReactNode;
  style?: ComponentProps<typeof View>['style'];
}) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: 14,
          borderCurve: 'continuous',
          overflow: 'hidden',
          marginBottom: 20,
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(0, 0, 0, 0.04)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export type SettingsRowProps = {
  label: string;
  subtitle?: string;
  leading?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  accessorySymbol?: string;
  labelTone?: 'default' | 'accent';
  style?: ComponentProps<typeof View>['style'];
  labelStyle?: ComponentProps<typeof Text>['style'];
};

export function SettingsRow({
  label,
  subtitle,
  leading,
  right,
  onPress,
  accessorySymbol,
  labelTone = 'default',
  style,
  labelStyle,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const Container = onPress ? Pressable : View;
  const labelColor = labelTone === 'accent' ? colors.warning : colors.text;

  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={onPress
        ? ({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 12,
              paddingHorizontal: 14,
              gap: 12,
            },
            style,
            pressed && { opacity: 0.7 },
          ]
        : [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 12,
              paddingHorizontal: 14,
              gap: 12,
            },
            style,
          ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {leading}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={[
              {
                color: labelColor,
                fontSize: 16,
                fontWeight: '500',
              },
              labelStyle,
            ]}
            selectable
          >
            {label}
          </Text>
          {subtitle
            ? (
                <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                  {subtitle}
                </Text>
              )
            : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {right}
        {accessorySymbol
          ? (
              <Image
                source={`sf:${accessorySymbol}`}
                style={{ width: 12, height: 12 }}
                tintColor={colors.textMuted}
              />
            )
          : null}
      </View>
    </Container>
  );
}
