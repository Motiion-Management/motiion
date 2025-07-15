import { api } from '@packages/backend/convex/_generated/api';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { Href } from 'expo-router';
import { useRef, useEffect, useState } from 'react';

export function useOnboardingStatus() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const status = useQuery(api.onboarding.getOnboardingStatus);
  const [stableStatus, setStableStatus] = useState(status);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Only debounce onboarding data updates, not auth state changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't debounce if user is not authenticated - handle immediately
    if (!isAuthenticated) {
      setStableStatus(null);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setStableStatus(status);
    }, 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, isAuthenticated]);

  // Determine user state based on auth and onboarding
  // Note: auth.userNotFound now triggers automatic sign out, so we don't need to handle it here
  const userNotFound = stableStatus === null;

  return {
    // Loading state - include auth loading state
    isLoading: authLoading || status === undefined || stableStatus === undefined,

    // User state
    userNotFound,

    // Authentication state
    requiresAuth: !isAuthenticated,
    hasAuthError: false, // Convex handles auth errors automatically

    // Completion status
    isComplete: stableStatus?.isComplete ?? false,

    // Current step information
    currentStep: stableStatus?.currentStep ?? null,
    currentStepIndex: stableStatus?.currentStepIndex ?? 0,
    totalSteps: stableStatus?.totalSteps ?? 1,

    // Progress tracking
    progress: stableStatus?.progress ?? 0,

    // Routing helpers
    shouldRedirect:
      !userNotFound &&
      isAuthenticated &&
      !stableStatus?.isComplete &&
      !!stableStatus?.currentStep,
    redirectPath:
      !isAuthenticated
        ? '/'
        : ((stableStatus?.redirectPath ?? '/(app)/onboarding/profile-type') as Href),

    // Version and metadata
    version: stableStatus?.version ?? 'v2',

    // Detailed information
    nextRequiredFields: stableStatus?.nextRequiredFields ?? [],
    missingFields: stableStatus?.missingFields ?? [],
    stepDescription: stableStatus?.stepDescription,

    // Helper functions
    getStepLabel: () => {
      if (!stableStatus?.currentStep) return 'COMPLETE';

      // Get profile type for label
      switch (stableStatus.currentStep) {
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

    getStepTitle: () => {
      if (!stableStatus?.currentStep) return 'Complete';

      switch (stableStatus.currentStep) {
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
    },

    getNextStepRoute: () => {
      if (!stableStatus || stableStatus.isComplete) return null;

      // If there's a redirect path from the backend analysis, use that
      if (stableStatus.redirectPath && stableStatus.redirectPath !== '/(app)') {
        return stableStatus.redirectPath;
      }

      return null;
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
