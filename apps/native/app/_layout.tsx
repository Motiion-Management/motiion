import '../global.css';

import 'expo-dev-client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import ConvexClientProvider from '~/components/providers/ConvexClientProvider';
import { AlertAnchor } from '~/components/ui/alert';
import { AlertRef } from '~/components/ui/alert/types';
import { useAuthenticated } from '~/hooks/useAuthenticated';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { PortalHost } from '@rn-primitives/portal';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const alertRef = React.useRef<AlertRef>(null);

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
            <ActionSheetProvider>
              <NavThemeProvider value={NAV_THEME[colorScheme]}>
                <ConvexClientProvider>
                  <RootStack />
                  <AlertAnchor ref={alertRef} />
                  <PortalHost />
                </ConvexClientProvider>
              </NavThemeProvider>
            </ActionSheetProvider>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}

const RootStack = () => {
  const { isLoading, isAuthenticated } = useAuthenticated();
  return (
    <Stack
      screenOptions={{
        animation: 'ios_from_right', // for android
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="auth"
        options={{
          // headerShown: false,
          title: 'auth',
        }}
      />
      <Stack.Protected guard={!isLoading && isAuthenticated}>
        <Stack.Screen name="app" />
      </Stack.Protected>

      <Stack.Screen
        name="(modals)"
        options={{
          // headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
};
