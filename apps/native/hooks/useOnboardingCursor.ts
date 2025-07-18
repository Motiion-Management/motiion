import { useSegments, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { getOnboardingFlow, ProfileType } from '@packages/backend/convex/onboardingConfig';

/**
 * Maps route segments to step names for navigation
 */
const ROUTE_TO_STEP_MAP = {
  'profile-type': 'profile-type',
  'headshots': 'headshots',
  'height': 'height',
  'ethnicity': 'ethnicity',
  'hair-color': 'hair-color',
  'eye-color': 'eye-color',
  'gender': 'gender',
  'sizing': 'sizing',
  'location': 'location',
  'work-location': 'work-location',
  'representation': 'representation',
  'experiences': 'experiences',
  'training': 'training',
  'skills': 'skills',
  'union': 'union',
  'database-use': 'database-use',
  'company': 'company',
} as const;

/**
 * Maps step names to route paths for navigation
 */
const STEP_TO_ROUTE_MAP = {
  'profile-type': '/app/onboarding/profile-type',
  'headshots': '/app/onboarding/headshots',
  'height': '/app/onboarding/height',
  'ethnicity': '/app/onboarding/ethnicity',
  'hair-color': '/app/onboarding/hair-color',
  'eye-color': '/app/onboarding/eye-color',
  'gender': '/app/onboarding/gender',
  'sizing': '/app/onboarding/sizing',
  'location': '/app/onboarding/location',
  'work-location': '/app/onboarding/work-location',
  'representation': '/app/onboarding/representation',
  'experiences': '/app/onboarding/experiences',
  'training': '/app/onboarding/training',
  'skills': '/app/onboarding/skills',
  'union': '/app/onboarding/union',
  'database-use': '/app/onboarding/database-use',
  'company': '/app/onboarding/company',
} as const;

/**
 * Hook for cursor-based onboarding navigation
 * Navigation is controlled by the current route/screen, not backend state
 */
export function useOnboardingCursor() {
  const segments = useSegments();
  const router = useRouter();
  const user = useQuery(api.users.getMyUser);

  // Get current step from the route
  const currentStep = useMemo(() => {
    // Extract the onboarding step from segments like ['app', 'onboarding', 'hair-color']
    if (segments.length >= 3 && segments[1] === 'onboarding') {
      const routeSegment = segments[2] as keyof typeof ROUTE_TO_STEP_MAP;
      return ROUTE_TO_STEP_MAP[routeSegment] || null;
    }
    return null;
  }, [segments]);

  // Get the flow for the current user's profile type
  const flow = useMemo(() => {
    if (!user?.profileType) return [];
    return getOnboardingFlow(user.profileType as ProfileType);
  }, [user?.profileType]);

  // Calculate current step index in the flow
  const currentStepIndex = useMemo(() => {
    if (!currentStep || !flow.length) return 0;
    const index = flow.findIndex(step => step.step === currentStep);
    return index >= 0 ? index : 0;
  }, [currentStep, flow]);

  // Calculate progress based on cursor position
  const progress = useMemo(() => {
    if (!flow.length) return 0;
    return Math.round((currentStepIndex / flow.length) * 100);
  }, [currentStepIndex, flow.length]);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < flow.length - 1) {
      const nextStep = flow[currentStepIndex + 1];
      const nextRoute = STEP_TO_ROUTE_MAP[nextStep.step as keyof typeof STEP_TO_ROUTE_MAP];
      if (nextRoute) {
        router.push(nextRoute);
        return true;
      }
    } else {
      // If we're at the last step, go to home
      router.push('/app/home');
      return true;
    }
    return false;
  }, [currentStepIndex, flow, router]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const previousStep = flow[currentStepIndex - 1];
      const previousRoute = STEP_TO_ROUTE_MAP[previousStep.step as keyof typeof STEP_TO_ROUTE_MAP];
      if (previousRoute) {
        router.push(previousRoute);
        return true;
      }
    }
    return false;
  }, [currentStepIndex, flow, router]);

  const goToStep = useCallback((stepName: string) => {
    const stepIndex = flow.findIndex(step => step.step === stepName);
    if (stepIndex >= 0) {
      const route = STEP_TO_ROUTE_MAP[stepName as keyof typeof STEP_TO_ROUTE_MAP];
      if (route) {
        router.push(route);
        return true;
      }
    }
    return false;
  }, [flow, router]);

  return {
    // Current state
    currentStep,
    currentStepIndex,
    totalSteps: flow.length,
    progress,
    
    // Navigation state
    canGoNext: currentStepIndex < flow.length - 1,
    canGoPrevious: currentStepIndex > 0,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === flow.length - 1,
    
    // Navigation functions
    goToNextStep,
    goToPreviousStep,
    goToStep,
    
    // Step information
    getCurrentStepConfig: () => flow[currentStepIndex] || null,
    getNextStepConfig: () => currentStepIndex < flow.length - 1 ? flow[currentStepIndex + 1] : null,
    getPreviousStepConfig: () => currentStepIndex > 0 ? flow[currentStepIndex - 1] : null,
    
    // Metadata
    flow,
    profileType: user?.profileType as ProfileType,
  };
}