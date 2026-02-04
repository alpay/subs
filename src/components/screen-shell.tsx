import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';

type ScreenShellProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
} & Omit<ScrollViewProps, 'contentContainerStyle'>;

export function ScreenShell({ children, contentContainerStyle, style, ...props }: ScreenShellProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <ScrollView
      {...props}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      contentInsetAdjustmentBehavior="automatic"
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
    </ScrollView>
  );
}
