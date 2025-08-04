import { useCallback } from 'react';
import { useSimpleOnboardingFlow } from './useSimpleOnboardingFlow';

/**
 * Simplified hybrid hook that uses the new static flow navigation
 * Provides compatibility with existing screens that use useHybridOnboarding
 */
export function useSimpleHybridOnboarding() {
  const flow = useSimpleOnboardingFlow();

  // Create a unified navigation interface
  const navigateNext = useCallback(async () => {
    flow.navigateNext();
    return true;
  }, [flow]);

  const navigatePrevious = useCallback(() => {
    flow.navigatePrevious();
    return true;
  }, [flow]);

  // Helper to handle auto-submit behavior
  // For simplicity, we'll enable auto-submit for most fields except file uploads
  const shouldAutoSubmit = useCallback(() => {
    const noAutoSubmitSteps = ['headshots', 'resume', 'experiences', 'complete'];
    return !noAutoSubmitSteps.includes(flow.currentStepId || '');
  }, [flow.currentStepId]);

  const getSubmitDelay = useCallback(() => {
    return 800; // Default delay
  }, []);

  return {
    // Navigation
    navigateNext,
    navigatePrevious,
    canGoNext: flow.canGoNext,
    canGoPrevious: flow.canGoPrevious,

    // Step info
    currentStep: {
      id: flow.currentStepId,
      autoSubmit: shouldAutoSubmit(),
      submitDelay: getSubmitDelay(),
    },
    currentStepId: flow.currentStepId,
    isV3Enabled: true, // Always true for simplified flow

    // Auto-submit config
    shouldAutoSubmit,
    getSubmitDelay,

    // Progress
    progress: flow.progress,
    currentIndex: flow.currentIndex,
    totalSteps: flow.totalSteps,

    // Loading state
    isLoading: flow.isLoading,
  };
}
