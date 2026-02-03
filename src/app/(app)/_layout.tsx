import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
