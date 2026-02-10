import { Stack } from 'expo-router';

const transparentModalOptions = {
  headerShown: false,
  presentation: 'transparentModal' as const,
  animation: 'fade' as const,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="lists" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="payment-methods" />
    </Stack>
  );
}
