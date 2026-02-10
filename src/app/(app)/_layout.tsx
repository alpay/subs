import { Stack } from 'expo-router';
import { Platform } from 'react-native';

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
      <Stack.Screen name="subscription/[id]" />
      <Stack.Screen name="subscription/add" />
      <Stack.Screen name="subscription/edit/[id]" />
      <Stack.Screen
        name="native-sheet"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.4],
          sheetCornerRadius: 24,
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },

          // Control the backdrop dimming (0 = no dim, 1 = full dim)
          // Or use 'transparent' for no overlay at all:
          // sheetBackdropColor: 'transparent',
        }}
      />
    </Stack>
  );
}
