'use client';

import { ClerkProvider, useAuth, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ActivityIndicator, View } from 'react-native';
import { AuthErrorBoundary } from '~/components/auth/AuthErrorBoundary';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function LoadingView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function StabilizedConvexProvider({ children }: { children: React.ReactNode }) {
  // Convex handles auth state synchronization with Clerk automatically
  return (
    <AuthErrorBoundary>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </AuthErrorBoundary>
  );
}

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ClerkLoaded>
        <StabilizedConvexProvider>{children}</StabilizedConvexProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
