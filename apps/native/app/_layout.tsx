import '../global.css';

import 'expo-dev-client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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
import { PortalHost } from '@rn-primitives/portal';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { isDarkColorScheme } = useColorScheme();
  const alertRef = React.useRef<AlertRef>(null);

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }} className="bg-surface-default">
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <ConvexClientProvider>
                <RootStack />
                <AlertAnchor ref={alertRef} />
              </ConvexClientProvider>
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
      <PortalHost />
    </>
  );
}

import { useAuth } from '@clerk/clerk-expo';

const RootStack = () => {
  // Use Clerk auth state only to gate access into /app
  const { isLoaded, isSignedIn } = useAuth();
  return (
    <Stack
      screenOptions={{
        animation: 'ios_from_right', // for android
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="auth"
        options={{
          // headerShown: false,
          title: 'auth',
        }}
      />
      <Stack.Protected guard={isLoaded && !!isSignedIn}>
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
