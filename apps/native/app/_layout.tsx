import 'react-native-get-random-values';
import '../global.css';

import 'expo-dev-client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import ConvexClientProvider from '~/components/providers/ConvexClientProvider';
import { AlertAnchor } from '~/components/ui/alert';
import { AlertRef } from '~/components/ui/alert/types';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { Toaster } from 'sonner-native';
import { useAuth } from '@clerk/clerk-expo';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

/**
 * Root layout - always renders Slot to ensure navigation is ready
 * Authentication logic is handled in nested layouts (app/_layout.tsx)
 *
 * This follows the Expo Router pattern from:
 * https://docs.expo.dev/router/advanced/authentication-rewrites/
 */
export default function RootLayout() {
  useInitialAndroidBarSync();
  const { isDarkColorScheme } = useColorScheme();
  const alertRef = React.useRef<AlertRef>(null);

  return (
    <ConvexClientProvider>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }} className="bg-surface-default">
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              {/* Always render Slot - no conditionals */}
              <Slot />
            </ActionSheetProvider>
          </BottomSheetModalProvider>
          <AlertAnchor ref={alertRef} />
          <Toaster position="top-center" richColors />
          <PortalHost />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ConvexClientProvider>
  );
}
