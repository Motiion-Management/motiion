'use client';

import { ClerkProvider, useAuth, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { resourceCache } from '@clerk/clerk-expo/resource-cache';

import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { QueryClient, QueryClientProvider, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { ConvexQueryClient } from '@convex-dev/react-query';

import { AuthErrorBoundary } from '~/components/auth/AuthErrorBoundary';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,     // 5 minutes - keeps subscription alive during navigation
      staleTime: 0,               // Irrelevant for Convex (data is always live via WebSocket)
      retry: false,               // Ignored by Convex adapter (uses own retry mechanism)
    }
  }
});

// Connect ConvexQueryClient to TanStack QueryClient
convexQueryClient.connect(queryClient);

function StabilizedConvexProvider({ children }: { children: React.ReactNode }) {
  // Provider order: QueryClient > ConvexProvider
  // QueryClient must wrap Convex so the adapter can access it
  return (
    <AuthErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </QueryClientProvider>
    </AuthErrorBoundary>
  );
}

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      __experimental_resourceCache={resourceCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <StabilizedConvexProvider>{children}</StabilizedConvexProvider>
    </ClerkProvider>
  );
}

// Export hook to access QueryClient for prefetching
export const useQueryClient = useTanstackQueryClient;
