import { api } from '@packages/backend/convex/_generated/api';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { Href } from 'expo-router';
import { useCallback } from 'react';

export function useOnboardingStatus(overrideStep?: string) {
  const { isLoading: authLoading } = useConvexAuth();
  const status = useQuery(api.onboarding.getOnboardingStatus);
  const user = useQuery(api.users.getMyUser);

  // Define all possible steps in order based on profile type
  const getAllSteps = useCallback((profileType: string) => {
    const dancerSteps = [
      'profile-type',
      'headshots',
      'height',
      'ethnicity',
      'hair-color',
      'eye-color',
      'gender',
      'sizing',
      'location',
      'work-location',
      'representation',
      'experiences',
      'training',
      'skills',
      'union',
    ];
    const guestSteps = ['profile-type', 'database-use', 'company'];
    const choreographerSteps = ['profile-type']; // Add more steps as needed

    switch (profileType) {
      case 'dancer':
        return dancerSteps;
      case 'guest':
        return guestSteps;
      case 'choreographer':
        return choreographerSteps;
      default:
        return dancerSteps;
    }
  }, []);

  // Calculate step index for override step if provided
  const getStepIndex = useCallback(
    (step: string, profileType: string) => {
      const steps = getAllSteps(profileType);
      const index = steps.findIndex((s) => s === step);
      return index >= 0 ? index : (status?.currentStepIndex ?? 0);
    },
    [getAllSteps, status]
  );

  const profileType = user?.profileType || 'dancer';
  const currentStepIndex = overrideStep
    ? getStepIndex(overrideStep, profileType)
    : (status?.currentStepIndex ?? 0);

  return {
    // Loading state - include auth loading state, but not when we know user doesn't exist
    isLoading: authLoading || status === undefined,

    // Completion status
    isComplete: status?.isComplete ?? false,

    // Current step information
    currentStep: status?.currentStep ?? null,
    currentStepIndex,
    totalSteps: status?.totalSteps ?? 1,

    // Progress tracking
    progress: status?.progress ?? 0,

    // Routing helpers
    shouldRedirect: !status?.isComplete && !!status?.currentStep,
    redirectPath: (status?.redirectPath ?? '/app/onboarding/profile-type') as Href,

    // Version and metadata
    version: status?.version ?? 'v2',

    // Detailed information
    nextRequiredFields: status?.nextRequiredFields ?? [],
    missingFields: status?.missingFields ?? [],
    stepDescription: status?.stepDescription,

    // Helper functions
    //
    getStepLabel: useCallback(
      (stepName?: string) => {
        const step = stepName || overrideStep || status?.currentStep;
        if (!step) return 'COMPLETE';

        // Get profile type for label
        switch (step) {
          case 'profile-type':
            return 'PROFILE';
          case 'headshots':
          case 'height':
          case 'ethnicity':
          case 'hair-color':
          case 'eye-color':
          case 'gender':
          case 'sizing':
          case 'location':
          case 'work-location':
          case 'representation':
          case 'experiences':
          case 'training':
          case 'skills':
          case 'union':
            return 'DANCER';
          case 'database-use':
          case 'company':
            return 'GUEST';
          default:
            return 'ONBOARDING';
        }
      },
      [overrideStep, status?.currentStep]
    ),

    getStepTitle: useCallback(() => {
      if (!status?.currentStep) return 'Complete';

      switch (status.currentStep) {
        case 'profile-type':
          return 'Profile Type';
        case 'headshots':
          return 'Upload Headshots';
        case 'height':
          return 'Height';
        case 'ethnicity':
          return 'Ethnicity';
        case 'hair-color':
          return 'Hair Color';
        case 'eye-color':
          return 'Eye Color';
        case 'gender':
          return 'Gender';
        case 'sizing':
          return 'Sizing Information';
        case 'location':
          return 'Location';
        case 'work-location':
          return 'Work Location';
        case 'representation':
          return 'Representation';
        case 'experiences':
          return 'Experience';
        case 'training':
          return 'Training';
        case 'skills':
          return 'Skills';
        case 'union':
          return 'Union Status';
        case 'database-use':
          return 'Database Use';
        case 'company':
          return 'Company Information';
        default:
          return 'Profile Setup';
      }
    }, [status?.currentStep]),

    getNextStepRoute: useCallback(() => {
      if (!status || status.isComplete) return null;

      // If there's a redirect path from the backend analysis, use that
      if (status.redirectPath && status.redirectPath !== '/app') {
        return status.redirectPath;
      }

      return null;
    }, [status]),
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
