import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { SharedUserProvider } from '~/contexts/SharedUserContext';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import DevOnboardingTools from '~/components/dev/DevOnboardingTools';

/**
 * App layout - handles authentication with declarative redirects
 *
 * Authentication flow:
 * 1. Checks Clerk auth state (isLoaded, isSignedIn)
 * 2. Shows loading placeholder while checking
 * 3. Redirects to /auth/login if not authenticated
 * 4. Renders app Stack if authenticated
 *
 * This follows the Expo Router pattern from:
 * https://docs.expo.dev/router/advanced/authentication-rewrites/
 */
export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <BackgroundGradientView>
        <View style={{ flex: 1 }} />
      </BackgroundGradientView>
    );
  }

  // Redirect to auth if not signed in
  if (!isSignedIn) {
    return <Redirect href="/auth/login" />;
  }

  // Render app if authenticated
  return (
    <SharedUserProvider>
      <BackgroundGradientView>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}>
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              headerShown: false,
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="dancers/[id]"
            options={{
              headerShown: false,
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
        </Stack>
        {/* Dev-only floating tools for onboarding iteration */}
        <DevOnboardingTools />
      </BackgroundGradientView>
    </SharedUserProvider>
  );
}
