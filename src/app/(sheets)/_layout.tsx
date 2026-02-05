import { Stack } from 'expo-router';

export default function SheetsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'formSheet',
        sheetAllowedDetents: [0.9],
        sheetGrabberVisible: true,
        headerTransparent: true,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
