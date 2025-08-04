import React from 'react';
import { useIsV3Onboarding } from '~/app/app/onboarding/_layout';

interface OnboardingScreenWrapperHybridProps {
  v1Component: React.ComponentType;
  screenName?: string;
}

/**
 * Hybrid wrapper that uses V1 UI components with V3 navigation
 * This allows us to keep the proven V1 UI while using V3's pre-calculated navigation
 */
export function OnboardingScreenWrapperHybrid({
  v1Component: V1Component,
  screenName,
}: OnboardingScreenWrapperHybridProps) {
  const useV3 = useIsV3Onboarding();

  // Log which mode is being used
  React.useEffect(() => {
    console.log(
      `[OnboardingScreenWrapperHybrid] ${screenName || 'Screen'} using`,
      useV3 ? 'V3 navigation with V1 UI' : 'V1 only'
    );
  }, [useV3, screenName]);

  // For now, always use V1 component
  // The V1 component will internally decide whether to use V3 navigation
  return <V1Component />;
}
