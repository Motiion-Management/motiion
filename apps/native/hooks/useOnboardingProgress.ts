import { api } from '@packages/backend/convex/_generated/api';
import {
  ONBOARDING_STEPS,
  getCurrentStepIndex,
  getTotalStepsForProfile,
  type ProfileType,
} from '@packages/backend/convex/validators/users';
import { useQuery } from 'convex/react';

export function useOnboardingProgress() {
  const user = useQuery(api.users.getMyUser);

  const profileType = user?.profileType as ProfileType | undefined;
  const onboardingStep = user?.onboardingStep ?? ONBOARDING_STEPS.PROFILE_TYPE;

  const currentStepIndex = getCurrentStepIndex(onboardingStep, profileType);
  const totalSteps = getTotalStepsForProfile(profileType);

  const getStepLabel = () => {
    if (!profileType) return 'PROFILE';

    switch (profileType) {
      case 'dancer':
        return 'DANCER';
      case 'choreographer':
        return 'CHOREOGRAPHER';
      case 'guest':
        return 'GUEST';
      default:
        return 'PROFILE';
    }
  };

  const getStepTitle = () => {
    if (onboardingStep === ONBOARDING_STEPS.PROFILE_TYPE) {
      return 'Profile Type';
    }

    switch (onboardingStep) {
      // Dancer steps
      case ONBOARDING_STEPS.DANCER_HEADSHOTS:
        return 'Upload Headshots';
      case ONBOARDING_STEPS.DANCER_PHYSICAL:
        return 'Physical Details';
      case ONBOARDING_STEPS.DANCER_SIZING:
        return 'Sizing Information';
      case ONBOARDING_STEPS.DANCER_LOCATION:
        return 'Location';
      case ONBOARDING_STEPS.DANCER_REPRESENTATION:
        return 'Representation';
      case ONBOARDING_STEPS.DANCER_RESUME:
        return 'Resume & Experience';
      case ONBOARDING_STEPS.DANCER_UNION:
        return 'Union Status';

      // Choreographer steps
      case ONBOARDING_STEPS.CHOREOGRAPHER_HEADSHOTS:
        return 'Upload Headshots';
      case ONBOARDING_STEPS.CHOREOGRAPHER_LOCATION:
        return 'Location';
      case ONBOARDING_STEPS.CHOREOGRAPHER_REPRESENTATION:
        return 'Representation';
      case ONBOARDING_STEPS.CHOREOGRAPHER_RESUME:
        return 'Resume & Experience';

      // Guest steps
      case ONBOARDING_STEPS.GUEST_DATABASE:
        return 'Database Use';
      case ONBOARDING_STEPS.GUEST_COMPANY:
        return 'Company Information';

      default:
        return 'Profile Setup';
    }
  };

  return {
    user,
    profileType,
    onboardingStep,
    currentStepIndex,
    totalSteps,
    stepLabel: getStepLabel(),
    stepTitle: getStepTitle(),
    isComplete: onboardingStep === ONBOARDING_STEPS.COMPLETE,
    isLoading: user === undefined,
  };
}
