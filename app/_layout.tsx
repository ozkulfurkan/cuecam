import {
  DarkTheme,
  DefaultTheme,
  ErrorBoundary as ExpoErrorBoundary,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { lockAsync } from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { APP_LOCK } from '@/features/camera/orientation';
import { buildSentryOptions } from '@/lib/monitoring';
import { ThemeProvider, useTheme } from '@/theme';

// Initialised before the first render so startup crashes are reported too.
Sentry.init(buildSentryOptions({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, isDev: __DEV__ }));

// React 19 handles render errors itself, so they never reach the global handler
// Sentry listens on. This boundary (it also covers every nested route) reports
// them, with the current route attached, and shows Expo Router's retry screen.
export const ErrorBoundary = Sentry.wrapExpoRouterErrorBoundary(ExpoErrorBoundary);

// app.config.ts allows rotation for the recorder; everything else is portrait.
// The recorder unlocks itself while open (useRecorderOrientationLock).
lockAsync(APP_LOCK).catch(Sentry.captureException);

function RootStack() {
  const { scheme, colors } = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      text: colors.text,
      notification: colors.record,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        {/* Recording covers the whole screen, outside the tab bar. */}
        <Stack.Screen name="record" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  root: { flex: 1 },
});
