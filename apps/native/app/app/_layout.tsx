import { Href, usePathname, useRouter, withLayoutContext } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { SharedUserProvider } from '~/contexts/SharedUserContext';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import DevOnboardingTools from '~/components/dev/DevOnboardingTools';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';
import { useInitialOnboardingStatus } from '~/hooks/useInitialOnboardingStatus';
import Transition, { createNativeStackNavigator } from 'react-native-screen-transitions';

// Create custom Stack with screen-transitions support
const { Navigator } = createNativeStackNavigator();
const Stack = withLayoutContext(Navigator);

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
  const { onboardingComplete, serverComplete, redirectPath } = useOnboardingStatus();
  const resolvedOnboardingStatus = serverComplete ?? onboardingComplete ?? null;
  const { hasResolved, statusChanged, acknowledgeStatusChange } =
    useInitialOnboardingStatus(resolvedOnboardingStatus);
  const isOnboardingRoute = pathname?.startsWith('/app/onboarding');
  const initialPathRef = useRef<string | null>(null);
  const forcedOnboardingRef = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    if (initialPathRef.current === null) {
      initialPathRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/auth');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!hasResolved || resolvedOnboardingStatus === null) return;

    const homeRoute = '/app/(tabs)/home' as const;
    const canGoBack = router.canGoBack?.() ?? false;
    const initialPath = initialPathRef.current;
    const isInitialOnboardingRoute = initialPath?.startsWith('/app/onboarding');
    const preservingDeepLink =
      isOnboardingRoute && isInitialOnboardingRoute && !statusChanged && !canGoBack;

    if (!resolvedOnboardingStatus) {
      if (!isOnboardingRoute && redirectPath && !preservingDeepLink) {
        const nextRoute = redirectPath as Href;
        if (pathname !== nextRoute) {
          forcedOnboardingRef.current = true;
          router.replace(nextRoute);
        }
      }

      if (statusChanged) {
        acknowledgeStatusChange();
      }

      return;
    }

    const shouldAutoExitOnboarding = forcedOnboardingRef.current && isOnboardingRoute;

    if (shouldAutoExitOnboarding && !preservingDeepLink && pathname !== homeRoute) {
      forcedOnboardingRef.current = false;
      router.replace(homeRoute);
    }

    if (statusChanged) {
      acknowledgeStatusChange();
    }
  }, [
    isLoaded,
    isSignedIn,
    hasResolved,
    resolvedOnboardingStatus,
    isOnboardingRoute,
    redirectPath,
    router,
    pathname,
    statusChanged,
    acknowledgeStatusChange,
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
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            animation: 'default',
          }}
        />
        <Stack.Screen
          name="dancers/[id]"
          options={{
            ...Transition.presets.SharedIGImage(),
            animation: 'none', // Let preset handle animation
            gestureEnabled: false, // Disable swipe gestures (page has many gestures)
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
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
