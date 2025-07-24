import { api } from '@packages/backend/convex/_generated/api';
import { ProfileType } from '@packages/backend/convex/onboardingConfig';
import { useQuery, useMutation } from 'convex/react';
import { useSegments, useRouter, Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useOnboardingFlow } from './useOnboardingFlow';

/**
 * Hook for cursor-based onboarding navigation
 * Navigation is controlled by the current route/screen, not backend state
 * Uses dynamic flow data from the server
 */
export function useOnboardingCursor() {
  const segments = useSegments();
  const router = useRouter();
  const user = useQuery(api.users.getMyUser);
  const validateStep = useMutation(api.onboarding.validateCurrentOnboardingStep);
  const setStep = useMutation(api.onboarding.setOnboardingStep);

  // Get dynamic flow data
  const {
    flow,
    getStepIdFromRoute,
    getStep,
    getStepIndex,
    getNextStep,
    getPreviousStep,
    calculateProgress,
    isLoading: flowLoading,
  } = useOnboardingFlow();

  // Get current step from the route
  const currentStep = useMemo(() => {
    // Extract the onboarding step from segments like ['app', 'onboarding', 'hair-color']
    if (segments.length >= 3 && segments[1] === 'onboarding') {
      const routePath = `/app/onboarding/${segments[2]}`;
      const stepId = getStepIdFromRoute(routePath);
      return stepId;
    }

    console.log('[useOnboardingCursor] No valid onboarding segments found');
    return null;
  }, [segments, getStepIdFromRoute, flow]);

  // Calculate current step index in the flow
  const currentStepIndex = useMemo(() => {
    if (!currentStep || !flow) return 0;
    const index = getStepIndex(currentStep);
    return index;
  }, [currentStep, flow, getStepIndex]);

  // Calculate progress based on cursor position
  const progress = useMemo(() => {
    if (!currentStep || !user) return 0;
    const prog = calculateProgress(currentStep, user);
    return prog;
  }, [currentStep, user, calculateProgress]);

  // Navigation functions
  const goToNextStep = useCallback(async () => {
    if (!currentStep || !user) {
      console.error('No current step or user data');
      return false;
    }

    try {
      // Validate current step before advancing
      const validation = await validateStep({ currentStep });

      if (!validation.isValid) {
        console.error('Cannot advance onboarding step:', {
          step: currentStep,
          missingFields: validation.missingFields,
        });
        return false;
      }

      // Get next step considering decision points
      const nextStep = getNextStep(currentStep, user);

      if (nextStep) {
        // Update backend step tracking before navigation
        await setStep({ step: nextStep.id });

        // Navigate to next step
        const nextRoute = nextStep.route;
        if (nextRoute) {
          router.push(nextRoute as Href);
          return true;
        }
      } else {
        // If we're at the last step, mark onboarding as complete and go to home
        router.push('/app/home' as Href);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating onboarding step:', error);
      return false;
    }
  }, [currentStep, user, router, validateStep, setStep, getNextStep]);

  const goToPreviousStep = useCallback(async () => {
    if (!currentStep) return false;

    const previousStep = getPreviousStep(currentStep);
    if (previousStep) {
      try {
        // Update backend step tracking to the previous step
        await setStep({ step: previousStep.id });

        const previousRoute = previousStep.route;
        if (previousRoute) {
          router.replace(previousRoute as Href);
          return true;
        }
      } catch (error) {
        console.error('Error updating step on goToPreviousStep:', error);
        // Still navigate even if backend update fails
        const previousRoute = previousStep.route;
        if (previousRoute) {
          router.replace(previousRoute as Href);
          return true;
        }
      }
    }
    return false;
  }, [currentStep, router, setStep, getPreviousStep]);

  const goToStep = useCallback(
    async (stepId: string) => {
      const step = getStep(stepId);
      if (step) {
        try {
          // Update backend step tracking to the target step
          await setStep({ step: stepId });

          const route = step.route;
          if (route) {
            router.push(route as Href);
            return true;
          }
        } catch (error) {
          console.error('Error updating step on goToStep:', error);
          // Still navigate even if backend update fails
          const route = step.route;
          if (route) {
            router.push(route as Href);
            return true;
          }
        }
      }
      return false;
    },
    [getStep, router, setStep]
  );

  // Get step configurations
  const getCurrentStepConfig = useCallback(() => {
    if (!currentStep) return null;
    return getStep(currentStep);
  }, [currentStep, getStep]);

  const getNextStepConfig = useCallback(() => {
    if (!currentStep || !user) return null;
    return getNextStep(currentStep, user);
  }, [currentStep, user, getNextStep]);

  const getPreviousStepConfig = useCallback(() => {
    if (!currentStep) return null;
    return getPreviousStep(currentStep);
  }, [currentStep, getPreviousStep]);

  // Debug navigation state calculations
  const canGoNext = currentStep ? !!getNextStep(currentStep, user || {}) : false;
  const canGoPrevious = currentStep ? !!getPreviousStep(currentStep) : false;
  const previousStep = currentStep ? getPreviousStep(currentStep) : null;
  const nextStep = currentStep ? getNextStep(currentStep, user || {}) : null;

  return {
    // Current state
    currentStep,
    currentStepIndex,
    totalSteps: flow?.steps.length || 0,
    progress,

    // Navigation state
    canGoNext,
    canGoPrevious,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStep ? !getNextStep(currentStep, user || {}) : false,

    // Navigation functions
    goToNextStep,
    goToPreviousStep,
    goToStep,
    getNextStepLink: () => {
      if (!currentStep || !user) return null;
      const nextStep = getNextStep(currentStep, user);
      return nextStep ? (nextStep.route as Href) : null;
    },
    getPreviousStepLink: () => {
      if (!currentStep) return null;
      const previousStep = getPreviousStep(currentStep);
      return previousStep ? (previousStep.route as Href) : null;
    },

    // Step information
    getCurrentStepConfig,
    getNextStepConfig,
    getPreviousStepConfig,

    // Metadata
    flow,
    profileType: user?.profileType as ProfileType,
    isLoading: flowLoading,
  };
}
