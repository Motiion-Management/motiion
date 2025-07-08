import { api } from '@packages/backend/convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';

export function useOnboardingStatus() {
  const status = useQuery(api.onboarding.getOnboardingStatus);

  return {
    // Loading state
    isLoading: status === undefined,

    // Completion status
    isComplete: status?.isComplete ?? false,

    // Current step information
    currentStep: status?.currentStep ?? null,
    currentStepIndex: status?.currentStepIndex ?? 0,
    totalSteps: status?.totalSteps ?? 1,

    // Progress tracking
    progress: status?.progress ?? 0,

    // Routing helpers
    shouldRedirect: !status?.isComplete && !!status?.currentStep,
    redirectPath: status?.redirectPath ?? '/(app)/onboarding/profile-type',

    // Version and metadata
    version: status?.version ?? 'v2',

    // Detailed information
    nextRequiredFields: status?.nextRequiredFields ?? [],
    missingFields: status?.missingFields ?? [],
    stepDescription: status?.stepDescription,

    // Helper functions
    getStepLabel: () => {
      if (!status?.currentStep) return 'COMPLETE';

      // Get profile type for label
      switch (status.currentStep) {
        case 'profile-type':
          return 'PROFILE';
        case 'headshots':
        case 'physical':
        case 'sizing':
        case 'location':
        case 'representation':
        case 'resume':
        case 'union':
          return 'DANCER';
        case 'company':
          return 'GUEST';
        default:
          return 'ONBOARDING';
      }
    },

    getStepTitle: () => {
      if (!status?.currentStep) return 'Complete';

      switch (status.currentStep) {
        case 'profile-type':
          return 'Profile Type';
        case 'headshots':
          return 'Upload Headshots';
        case 'physical':
          return 'Physical Details';
        case 'sizing':
          return 'Sizing Information';
        case 'location':
          return 'Location';
        case 'representation':
          return 'Representation';
        case 'resume':
          return 'Resume & Experience';
        case 'union':
          return 'Union Status';
        case 'company':
          return 'Company Information';
        default:
          return 'Profile Setup';
      }
    },
  };
}

export function useOnboardingCompletion() {
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);
  const resetOnboarding = useMutation(api.onboarding.resetOnboarding);

  return {
    completeOnboarding,
    resetOnboarding,
  };
}

export function useOnboardingProgress() {
  const progress = useQuery(api.onboarding.getOnboardingProgress);

  return {
    isLoading: progress === undefined,
    progress: progress?.progress ?? 0,
    currentStep: progress?.currentStep ?? null,
    currentStepIndex: progress?.currentStepIndex ?? 0,
    totalSteps: progress?.totalSteps ?? 1,
    isComplete: progress?.isComplete ?? false,
  };
}

export function useOnboardingDebug() {
  const debug = useQuery(api.onboarding.debugOnboardingStatus);

  return {
    isLoading: debug === undefined,
    debugInfo: debug,
  };
}
