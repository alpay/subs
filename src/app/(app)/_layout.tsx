import { Stack } from 'expo-router';

const transparentModalOptions = {
  headerShown: false,
  presentation: 'transparentModal' as const,
  animation: 'fade' as const,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerShadowVisible: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="add-subscription" options={transparentModalOptions} />
      <Stack.Screen name="amount-picker" options={transparentModalOptions} />
      <Stack.Screen name="analytics" options={transparentModalOptions} />
      <Stack.Screen name="categories" options={transparentModalOptions} />
      <Stack.Screen name="csv-import" options={transparentModalOptions} />
      <Stack.Screen name="currency" options={transparentModalOptions} />
      <Stack.Screen name="date-picker" options={transparentModalOptions} />
      <Stack.Screen name="icon-picker" options={transparentModalOptions} />
      <Stack.Screen name="lists" options={transparentModalOptions} />
      <Stack.Screen name="notification-settings" options={transparentModalOptions} />
      <Stack.Screen name="payment-methods" options={transparentModalOptions} />
      <Stack.Screen name="settings" options={transparentModalOptions} />
      <Stack.Screen name="subscription-form" options={transparentModalOptions} />
    </Stack>
  );
}
