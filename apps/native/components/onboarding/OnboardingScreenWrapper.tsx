import React from 'react';
import { GenericOnboardingScreenV3 } from './GenericOnboardingScreenV3';
import { useIsV3Onboarding } from '~/app/app/onboarding/_layout';
import { OnboardingV3ErrorBoundary } from './OnboardingV3ErrorBoundary';

interface OnboardingScreenWrapperProps {
  v1Component: React.ComponentType;
  screenName?: string;
}

/**
 * Wrapper component that automatically switches between V1 and V3 onboarding
 * based on the V3 feature flag
 */
export function OnboardingScreenWrapper({
  v1Component: V1Component,
  screenName,
}: OnboardingScreenWrapperProps) {
  const useV3 = useIsV3Onboarding();

  // Log which version is being used
  React.useEffect(() => {
    console.log(`[OnboardingScreenWrapper] ${screenName || 'Screen'} using`, useV3 ? 'V3' : 'V1');
  }, [useV3, screenName]);

  if (useV3) {
    return (
      <OnboardingV3ErrorBoundary fallback={V1Component}>
        <GenericOnboardingScreenV3 />
      </OnboardingV3ErrorBoundary>
    );
  }

  return <V1Component />;
}

/**
 * HOC to wrap any onboarding screen with V3 detection
 */
export function withV3Detection<P extends object>(
  V1Component: React.ComponentType<P>,
  screenName?: string
) {
  return function V3DetectedScreen(props: P) {
    return (
      <OnboardingScreenWrapper
        v1Component={() => <V1Component {...props} />}
        screenName={screenName}
      />
    );
  };
}
