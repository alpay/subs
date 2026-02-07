import { Stack } from 'expo-router';

const transparentModalOptions = {
  headerShown: false,
  presentation: 'transparentModal' as const,
  animation: 'fade' as const,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={transparentModalOptions} />
      <Stack.Screen name="categories" options={transparentModalOptions} />
      <Stack.Screen name="lists" options={transparentModalOptions} />
      <Stack.Screen name="currency" options={transparentModalOptions} />
      <Stack.Screen name="payment-methods" options={transparentModalOptions} />
      <Stack.Screen name="notification-settings" options={transparentModalOptions} />
    </Stack>
  );
}
