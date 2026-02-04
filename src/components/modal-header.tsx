import type { ReactNode } from 'react';

import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

import { IconButton } from './icon-button';

type ModalHeaderProps = {
  title: string;
  right?: ReactNode;
};

export function ModalHeader({ title, right }: ModalHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Stack.Screen
      options={{
        title,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
        headerTitleAlign: 'center',
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {right}
            <IconButton symbol="xmark" onPress={() => router.back()} />
          </View>
        ),
      }}
    />
  );
}
