import '../global.css';
import 'expo-dev-client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { Host } from '@expo/ui/swift-ui';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import ConvexClientProvider from '~/components/providers/ConvexClientProvider';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const { width } = Dimensions.get('window');

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <NavThemeProvider value={NAV_THEME[colorScheme]}>
                <ConvexClientProvider>
                  <Stack
                    screenOptions={{
                      animation: 'ios_from_right', // for android
                    }}>
                    <Stack.Screen
                      name="index"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="auth"
                      options={{
                        headerShown: false,
                        title: 'auth',
                      }}
                    />

                    <Stack.Screen
                      name="(modals)"
                      options={{
                        headerShown: false,
                        presentation: 'modal',
                      }}
                    />
                  </Stack>
                </ConvexClientProvider>
              </NavThemeProvider>
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </>
  );
}
