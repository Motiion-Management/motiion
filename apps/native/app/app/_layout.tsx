import { Href, Stack, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { SharedUserProvider } from '~/contexts/SharedUserContext';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import DevOnboardingTools from '~/components/dev/DevOnboardingTools';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

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
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const { onboardingComplete, redirectPath } = useOnboardingStatus();
  const isOnboardingRoute = pathname?.startsWith('/app/onboarding');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/auth');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (onboardingComplete === null) return;

    if (onboardingComplete === false && !isOnboardingRoute && redirectPath) {
      router.replace(redirectPath as Href);
      return;
    }

    if (onboardingComplete === true && isOnboardingRoute) {
      const homeRoute = '/app/(tabs)/home' as const;
      if (pathname !== homeRoute) {
        router.replace(homeRoute as Href);
      }
    }
  }, [
    isLoaded,
    isSignedIn,
    onboardingComplete,
    isOnboardingRoute,
    redirectPath,
    router,
    pathname,
  ]);

  const content = (
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
      {!isLoaded && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      )}
    </BackgroundGradientView>
  );

  if (!isLoaded || !isSignedIn) {
    return content;
  }

  return <SharedUserProvider>{content}</SharedUserProvider>;
}
