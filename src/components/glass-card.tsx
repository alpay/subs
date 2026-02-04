import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Card } from 'heroui-native';

import { useTheme } from '@/lib/hooks/use-theme';

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, style }: GlassCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Card
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 28,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          boxShadow: isDark
            ? '0 20px 40px rgba(0, 0, 0, 0.35)'
            : '0 18px 30px rgba(15, 23, 42, 0.12)',
        },
        style,
      ]}
    >
      {children}
    </Card>
  );
}

export function GlassCardBody({ children, style }: GlassCardProps) {
  return (
    <Card.Body style={[{ gap: 12 }, style]}>
      {children}
    </Card.Body>
  );
}

export function GlassCardHeader({ children, style }: GlassCardProps) {
  return (
    <Card.Header style={[{ gap: 6 }, style]}>
      {children}
    </Card.Header>
  );
}

export function GlassCardFooter({ children, style }: GlassCardProps) {
  return (
    <Card.Footer style={[{ gap: 8 }, style]}>
      {children}
    </Card.Footer>
  );
}
