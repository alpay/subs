import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';

import { ModalHeader } from './modal-header';

type FormSheetProps = {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  footer?: ReactNode;
  footerContainerStyle?: StyleProp<ViewStyle>;
  closeVariant?: 'plain' | 'muted';
};

export function FormSheet({
  title,
  right,
  children,
  contentContainerStyle,
  scrollViewProps,
  footer,
  footerContainerStyle,
  closeVariant = 'plain',
}: FormSheetProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const hasFooter = Boolean(footer);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ModalHeader title={title} right={right} onClose={() => router.back()} closeVariant={closeVariant} />
      <ScrollView
        {...scrollViewProps}
        style={[{ flex: 1 }, scrollViewProps?.style]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          {
            padding: 20,
            paddingBottom: hasFooter ? bottom + 120 : bottom + 40,
            gap: 16,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
      {footer
        ? (
            <View
              style={[
                {
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: bottom + 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.surfaceBorder,
                  backgroundColor: colors.background,
                  gap: 12,
                },
                footerContainerStyle,
              ]}
            >
              {footer}
            </View>
          )
        : null}
    </View>
  );
}
