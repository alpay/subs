import { Stack } from 'expo-router';
import { Platform } from 'react-native';

const transparentModalOptions = {
  headerShown: false,
  presentation: 'transparentModal' as const,
  animation: 'fade' as const,
  contentStyle: { backgroundColor: 'transparent' },
};

const sheetBaseOptions = {
  presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
  // sheetAllowedDetents: [0.4],
  // Control the backdrop dimming (0 = no dim, 1 = full dim)
  // Or use 'transparent' for no overlay at all:
  // sheetBackdropColor: 'transparent',
} as const;

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true }}>

      {/* Main Screens */}
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="services" />

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

      <Stack.Screen name="analytics" options={transparentModalOptions} />
      <Stack.Screen name="csv-import" options={transparentModalOptions} />
      <Stack.Screen
        name="date-picker"
        options={{
          ...sheetBaseOptions,
          sheetAllowedDetents: 'fitToContents' as const,
        }}
      />
      <Stack.Screen name="icon-picker" options={transparentModalOptions} />
      <Stack.Screen name="settings" options={transparentModalOptions} />

    </Stack>
  );
}
