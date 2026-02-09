import { Stack } from 'expo-router';

const transparentModalOptions = {
  headerShown: false,
  presentation: 'transparentModal' as const,
  animation: 'fade' as const,
  contentStyle: { backgroundColor: 'transparent' },
};

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="services" />
      <Stack.Screen name="amount-picker" options={transparentModalOptions} />
      <Stack.Screen name="analytics" options={transparentModalOptions} />
      <Stack.Screen name="csv-import" options={transparentModalOptions} />
      <Stack.Screen name="date-picker" options={transparentModalOptions} />
      <Stack.Screen name="icon-picker" options={transparentModalOptions} />
      <Stack.Screen name="settings" options={transparentModalOptions} />
      <Stack.Screen
        name="subscription/[id]"
        options={{
          title: '',
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="subscription/add"
        options={{
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="subscription/edit/[id]"
        options={{
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
