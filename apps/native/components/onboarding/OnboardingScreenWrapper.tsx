import React from 'react';

interface OnboardingScreenWrapperProps {
  v1Component: React.ComponentType;
  screenName?: string;
}

/**
 * Simple wrapper component for onboarding screens
 */
export function OnboardingScreenWrapper({
  v1Component: V1Component,
}: OnboardingScreenWrapperProps) {
  return <V1Component />;
}
