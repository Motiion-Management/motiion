import { useCallback } from 'react';
import { useOnboardingFlowV3 } from './useOnboardingFlowV3';
import { useIsV3Onboarding } from '~/app/app/onboarding/_layout';

/**
 * Hybrid hook that uses V3 navigation with V1 form components
 * This provides the best of both worlds:
 * - V3's pre-calculated navigation (no backend calls)
 * - V1's proven UI components and form handling
 */
export function useHybridOnboarding() {
  const useV3 = useIsV3Onboarding();
  const v3Flow = useOnboardingFlowV3();

  // Create a unified navigation interface
  const navigateNext = useCallback(async () => {
    if (useV3 && v3Flow.navigateNext) {
      // Use V3's pre-calculated navigation
      v3Flow.navigateNext();
      return true;
    }
    return false;
  }, [useV3, v3Flow]);

  const navigatePrevious = useCallback(() => {
    if (useV3 && v3Flow.navigatePrevious) {
      v3Flow.navigatePrevious();
      return true;
    }
    return false;
  }, [useV3, v3Flow]);

  // Helper to handle auto-submit behavior
  const shouldAutoSubmit = useCallback(() => {
    if (!useV3) return false;
    return v3Flow.currentStep?.autoSubmit ?? false;
  }, [useV3, v3Flow.currentStep]);

  const getSubmitDelay = useCallback(() => {
    if (!useV3) return 0;
    return v3Flow.currentStep?.submitDelay ?? 800;
  }, [useV3, v3Flow.currentStep]);

  return {
    // Navigation
    navigateNext,
    navigatePrevious,
    canGoNext: useV3 ? v3Flow.canGoNext : false,
    canGoPrevious: useV3 ? v3Flow.canGoPrevious : false,
    
    // Step info
    currentStep: v3Flow.currentStep,
    currentStepId: v3Flow.currentStepId,
    isV3Enabled: useV3,
    
    // Auto-submit config
    shouldAutoSubmit,
    getSubmitDelay,
    
    // Progress
    progress: v3Flow.progress,
    currentIndex: v3Flow.currentIndex,
    totalSteps: v3Flow.totalSteps,
    
    // Loading state
    isLoading: v3Flow.isLoading,
  };
}