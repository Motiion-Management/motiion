import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useAuthenticated } from '~/hooks/useAuthenticated';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

/**
 * Root index route - handles initial navigation based on auth state
 * Following Expo Router authentication pattern:
 * - Authenticated users → /app
 * - Unauthenticated users → /auth (landing page)
 */
export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuthenticated();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <BackgroundGradientView>
        <View style={{ flex: 1 }} />
      </BackgroundGradientView>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/app" />;
  }

  return <Redirect href="/auth" />;
}
