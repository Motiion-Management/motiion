import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { AuthErrorBoundary } from '~/components/auth/AuthErrorBoundary';
import { perfLog, perfMark, perfMeasure } from '~/utils/performanceDebug';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';

interface OnboardingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OnboardingGuard({ children, fallback }: OnboardingGuardProps) {
  // Minimal server-side check: should we send user into onboarding, and where?
  const redirectInfo = useQuery(api.onboarding.getOnboardingRedirect);

  // Show loading state while checking onboarding status
  if (redirectInfo === undefined) {
    return (
      fallback ?? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      )
    );
  }

  // Redirect to onboarding if not complete
  if (redirectInfo.shouldRedirect) {
    return <Redirect href={redirectInfo.redirectPath as Href} />;
  }

  // User has completed onboarding, render protected content
  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}

interface OnboardingStepGuardProps {
  children: React.ReactNode;
  requiredStep: string;
  fallback?: React.ReactNode;
}

// Component to protect individual onboarding steps
export function OnboardingStepGuard({
  children,
  requiredStep,
  fallback,
}: OnboardingStepGuardProps) {
  // const { isLoading, isComplete } = useOnboardingStatus();
  // const { flow, getStep, isLoading: flowLoading } = useSharedOnboardingFlow();
  //
  // // Track guard evaluation
  // useEffect(() => {
  //   perfMark(`stepGuard:${requiredStep}:start`);
  //   perfLog('stepGuard:evaluating', {
  //     requiredStep,
  //     isLoading,
  //     flowLoading,
  //     hasFlow: !!flow,
  //   });
  //
  //   return () => {
  //     perfMeasure(`stepGuard:${requiredStep}:start`, `stepGuard:${requiredStep}:end`);
  //   };
  // }, [requiredStep]);
  //
  // // Show loading state
  // if (isLoading || flowLoading) {
  //   return (
  //     fallback ?? (
  //       <View className="flex-1 items-center justify-center">
  //         <ActivityIndicator size="large" />
  //       </View>
  //     )
  //   );
  // }
  //
  // // If onboarding is complete, redirect to home
  // if (isComplete) {
  //   return <Redirect href="/app/home" />;
  // }
  //
  // // Validate that the required step exists in the flow
  // if (flow && !getStep(requiredStep)) {
  //   console.warn(`Step "${requiredStep}" not found in onboarding flow`);
  // }

  // Allow access to any onboarding step - let users navigate freely
  // The backend will handle validation when they try to advance
  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}

interface OnboardingCompleteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Component to protect content that should only be shown to completed users
export function OnboardingCompleteGuard({ children, fallback }: OnboardingCompleteGuardProps) {
  const redirectInfo = useQuery(api.onboarding.getOnboardingRedirect);

  // Show loading state
  if (redirectInfo === undefined) {
    return (
      fallback ?? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      )
    );
  }

  // If onboarding is not complete, redirect to current step
  if (redirectInfo.shouldRedirect) {
    return <Redirect href={redirectInfo.redirectPath as Href} />;
  }

  // User has completed onboarding, render protected content
  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}
