import { useAuth } from '@clerk/clerk-expo';
import { api } from '@packages/backend/convex/_generated/api';
// import { useConvexAuth, useQuery } from 'convex/react';
import { Stack, Redirect, usePathname } from 'expo-router';
import React from 'react';
// import { View, ActivityIndicator } from 'react-native';

// function useAuthState() {
//   const { isLoaded: clerkLoaded, isSignedIn, signOut } = useAuth();
//   const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
//   const user = useQuery(api.users.getMyUser);
//   const onboardingStatus = useQuery(api.onboarding.getOnboardingStatus);
//
//   // Calculate overall loading state
//   const isLoading = !clerkLoaded || convexLoading || (isSignedIn && user === undefined);
//
//   // State reconciliation: if Clerk thinks we're signed in but Convex user doesn't exist
//   React.useEffect(() => {
//     if (clerkLoaded && isSignedIn && !convexLoading && user === null) {
//       console.log('🔄 Auth reconciliation: Clerk authenticated but no Convex user, signing out');
//       signOut();
//     }
//   }, [clerkLoaded, isSignedIn, convexLoading, user, signOut]);
//
//   // Determine auth state
//   const authState = React.useMemo(() => {
//     if (isLoading) return 'loading';
//     if (!isSignedIn || !isAuthenticated || !user) return 'unauthenticated';
//
//     // Check onboarding status
//     if (!onboardingStatus) return 'loading';
//     if (!onboardingStatus.isComplete) {
//       return {
//         state: 'onboarding',
//         redirectPath: onboardingStatus.redirectPath || '/app/onboarding/profile-type',
//       };
//     }
//
//     return 'authenticated';
//   }, [isLoading, isSignedIn, isAuthenticated, user, onboardingStatus]);
//
//   return authState;
// }

export default function AppLayout() {
  // const authState = useAuthState();
  //
  // const pathname = usePathname();
  // console.log('📍 Current Pathname:', pathname);
  // console.log('📱 APP_LAYOUT: Auth state', authState);
  //
  // // Loading state
  // if (authState === 'loading') {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }
  //
  // // Not authenticated - redirect to landing
  // if (authState === 'unauthenticated') {
  //   return <Redirect href="/" />;
  // }

  // Fully authenticated and onboarding complete
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
