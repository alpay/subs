import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="lists" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="icloud-data" />
    </Stack>
  );
}
