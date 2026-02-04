import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
