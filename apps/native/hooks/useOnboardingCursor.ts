import { api } from '@packages/backend/convex/_generated/api';
import { ProfileType } from '@packages/backend/convex/onboardingConfig';
import { useQuery, useMutation } from 'convex/react';
import { useSegments, useRouter, Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useSharedOnboardingFlow } from '~/contexts/OnboardingFlowContext';
import { useUser } from './useUser';
import { useClientSideValidation } from './useClientSideValidation';
import { useBackgroundSync } from './useBackgroundSync';
import { perfLog, perfMark, perfMeasure, trackNavigation } from '~/utils/performanceDebug';

/**
 * Hook for cursor-based onboarding navigation
 * Navigation is controlled by the current route/screen, not backend state
 * Uses dynamic flow data from the server
 */
export function useOnboardingCursor() {
  const segments = useSegments();
  const router = useRouter();
  const { user } = useUser();
  const validateStep = useMutation(api.onboarding.validateCurrentOnboardingStep);
  const setStep = useMutation(api.onboarding.setOnboardingStep);
  const { validateStep: validateClientSide } = useClientSideValidation();
  const { queueTask } = useBackgroundSync();

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
  } = useSharedOnboardingFlow();

  // Get current step from the route
  const currentStep = useMemo(() => {
    // Extract the onboarding step from segments like ['app', 'onboarding', 'hair-color']
    if (segments.length >= 3 && segments[1] === 'onboarding') {
      const routePath = `/app/onboarding/${segments[2]}`;
      const stepId = getStepIdFromRoute(routePath);
      perfMeasure('cursor:getCurrentStep', undefined, { stepId, routePath });
      return stepId;
    }

    console.log('[useOnboardingCursor] No valid onboarding segments found');
    perfMeasure('cursor:getCurrentStep', undefined, { stepId: null });
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

  // Navigation functions - Local-first with optimistic updates
  const goToNextStep = useCallback(() => {
    if (!currentStep || !user || !flow) {
      console.error('No current step, user data, or flow data');
      return false;
    }

    // 1. Get current step configuration
    const currentStepConfig = getStep(currentStep);

    if (!currentStepConfig) {
      console.error('Current step configuration not found');
      trackNavigation.complete();
      return false;
    }

    // 2. Client-side validation (immediate, no backend call)
    perfMark('navigation:clientValidation');
    const validation = validateClientSide(currentStepConfig, user);
    perfMeasure('navigation:clientValidation', undefined, {
      isValid: validation.isValid,
      missingFields: validation.missingFields?.length || 0,
    });

    if (!validation.isValid) {
      console.error('Client-side validation failed:', {
        step: currentStep,
        missingFields: validation.missingFields,
      });
      trackNavigation.validationComplete(false, { missingFields: validation.missingFields });
      trackNavigation.complete();
      return false;
    }

    trackNavigation.validationComplete(true);

    // 3. Get next step considering decision points
    perfMark('navigation:calculateNextStep');
    const nextStep = getNextStep(currentStep, user);
    perfMeasure('navigation:calculateNextStep', undefined, {
      nextStepId: nextStep?.id,
      nextRoute: nextStep?.route,
    });

    if (nextStep) {
      // 4. Navigate immediately (optimistic update)
      const nextRoute = nextStep.route;
      if (nextRoute) {
        perfMark('navigation:routerPush');
        router.push(nextRoute as Href);
        perfMeasure('navigation:routerPush');
        trackNavigation.routingComplete();

        // 5. Queue backend update (non-blocking)
        perfLog('navigation:queueBackendSync', { currentStep, nextStep: nextStep.id });
        queueTask(
          async () => {
            perfMark('navigation:backendSync');
            // Optionally validate on backend for consistency
            await validateStep({ currentStep });
            // Update backend step tracking
            await setStep({ step: nextStep.id });
            perfMeasure('navigation:backendSync');
          },
          {
            id: `advance-step-${currentStep}-to-${nextStep.id}`,
            maxRetries: 3,
          }
        );

        return true;
      }
    } else {
      // Last step - navigate to home
      router.push('/app/home' as Href);

      // Queue completion update
      queueTask(
        async () => {
          // Mark onboarding as complete in backend
          await setStep({ step: 'complete' });
        },
        { id: 'complete-onboarding', maxRetries: 3 }
      );

      trackNavigation.complete();
      return true;
    }

    trackNavigation.complete();
    return false;
  }, [
    currentStep,
    user,
    flow,
    router,
    validateStep,
    setStep,
    getNextStep,
    getStep,
    validateClientSide,
    queueTask,
  ]);

  const goToPreviousStep = useCallback(() => {
    perfLog('goToPreviousStep:start', { currentStep });

    if (!currentStep) {
      perfLog('goToPreviousStep:failed', { reason: 'no current step' });
      return false;
    }

    trackNavigation.start(currentStep, 'previous');

    perfMark('navigation:calculatePreviousStep');
    const previousStep = getPreviousStep(currentStep);
    perfMeasure('navigation:calculatePreviousStep', undefined, {
      previousStepId: previousStep?.id,
      previousRoute: previousStep?.route,
    });

    if (previousStep) {
      const previousRoute = previousStep.route;
      if (previousRoute) {
        // Navigate immediately
        perfMark('navigation:routerPush');
        router.replace(previousRoute as Href);
        perfMeasure('navigation:routerPush');
        trackNavigation.routingComplete();

        // Queue backend update (non-blocking)
        queueTask(
          async () => {
            await setStep({ step: previousStep.id });
          },
          {
            id: `back-step-${currentStep}-to-${previousStep.id}`,
            maxRetries: 2,
          }
        );

        trackNavigation.complete();
        return true;
      }
    }

    trackNavigation.complete();
    return false;
  }, [currentStep, router, setStep, getPreviousStep, queueTask]);

  const goToStep = useCallback(
    (stepId: string) => {
      perfLog('goToStep:start', { targetStep: stepId, currentStep });
      trackNavigation.start(currentStep || 'unknown', stepId);

      perfMark('navigation:getStep');
      const step = getStep(stepId);
      perfMeasure('navigation:getStep', undefined, { found: !!step });

      if (step) {
        const route = step.route;
        if (route) {
          // Navigate immediately
          perfMark('navigation:routerPush');
          router.push(route as Href);
          perfMeasure('navigation:routerPush');
          trackNavigation.routingComplete();

          // Queue backend update (non-blocking)
          queueTask(
            async () => {
              await setStep({ step: stepId });
            },
            {
              id: `goto-step-${stepId}`,
              maxRetries: 2,
            }
          );

          trackNavigation.complete();
          return true;
        }
      }

      trackNavigation.complete();
      return false;
    },
    [getStep, router, setStep, queueTask, currentStep]
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
