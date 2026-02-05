import type { ReactNode } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/lib/api';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';

import '../global.css';
import 'heroui-native/styles';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  useBootstrap();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {
      // Ignore splash hide errors in development.
    });
  }, []);

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: ReactNode }) {
  const { colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardProvider>
        <HeroUINativeProvider>
          <APIProvider>
            <BottomSheetModalProvider>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              {children}
            </BottomSheetModalProvider>
          </APIProvider>
        </HeroUINativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
