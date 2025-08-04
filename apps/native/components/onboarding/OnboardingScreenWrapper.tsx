import React from 'react';
import { useIsV3Onboarding } from '~/app/app/onboarding/_layout';

interface OnboardingScreenWrapperProps {
  v1Component: React.ComponentType;
  screenName?: string;
}

/**
 * Updated wrapper that always uses V1 components
 * V3 logic is handled inside the components via useHybridOnboarding hook
 */
export function OnboardingScreenWrapper({
  v1Component: V1Component,
  screenName,
}: OnboardingScreenWrapperProps) {
  const useV3 = useIsV3Onboarding();

  // Log which version is being used
  React.useEffect(() => {
    console.log(
      `[OnboardingScreenWrapper] ${screenName || 'Screen'} using V1 component with`,
      useV3 ? 'V3 navigation' : 'V1 navigation'
    );
  }, [useV3, screenName]);

  // Always use V1 component - it will internally handle V3 logic via useHybridOnboarding
  return <V1Component />;
}
