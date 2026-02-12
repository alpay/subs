import { Stack } from 'expo-router';
import { Platform } from 'react-native';

const sheetBaseOptions = {
  presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
  sheetGrabberVisible: true,
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
} as const;

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true }}>

      {/* Main Screens */}
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="services" />
      <Stack.Screen
        name="analytics"
        options={{
          ...sheetBaseOptions,
          sheetAllowedDetents: 'fitToContents' as const,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          ...sheetBaseOptions,
          sheetAllowedDetents: [0.95] as const,
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          ...sheetBaseOptions,
          sheetAllowedDetents: 'fitToContents' as const,
        }}
      />

      {/* Subscription Screens */}
      <Stack.Screen name="subscription/[id]" />
      <Stack.Screen name="subscription/add" />
      <Stack.Screen name="subscription/edit/[id]" />

      {/* Bottom Sheet Screens */}
      <Stack.Screen
        name="amount-picker"
        options={{
          ...sheetBaseOptions,
          sheetAllowedDetents: 'fitToContents' as const,
        }}
      />
      <Stack.Screen
        name="subscription/day-view/[date]"
        options={{
          ...sheetBaseOptions,
          sheetAllowedDetents: 'fitToContents' as const,
        }}
      />
    </Stack>
  );
}
