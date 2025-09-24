import { useRouter, useSegments, Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useUser } from './useUser';
import {
  ONBOARDING_GROUPS,
  ONBOARDING_GROUP_FLOWS,
  type OnboardingGroupKey as GroupKey,
  type OnboardingGroupConfig as GroupConfig,
  type ProfileType,
} from '@packages/backend/convex/onboardingConfig';

// Re-export for backwards compatibility
export { ONBOARDING_GROUPS, ONBOARDING_GROUP_FLOWS };
export type { GroupKey, GroupConfig };

interface UseOnboardingGroupFlowReturn {
  // Current state
  currentGroup: GroupKey | null;
  currentStepInGroup: number;
  totalStepsInGroup: number;
  currentStepId: string | null;

  // Group-level state
  groupProgress: number; // Progress within current group (0-100)
  overallProgress: number; // Progress across all groups (0-100)
  groups: Array<{
    key: GroupKey;
    label: string;
    completed: boolean;
    progress: number;
    isActive: boolean;
  }>;

  // Navigation state
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
  canNavigateToNextGroup: boolean;
  canNavigateToPreviousGroup: boolean;

  // Navigation methods
  navigateToNextStep: () => void;
  navigateToPreviousStep: () => void;
  navigateToNextGroup: () => void;
  navigateToPreviousGroup: () => void;
  navigateToGroup: (group: GroupKey) => void;
  navigateToStep: (stepId: string) => void;

  // Progress calculation
  getGroupProgress: (groupKey: GroupKey) => number;
  isGroupCompleted: (groupKey: GroupKey) => boolean;

  // Loading state
  isLoading: false;
}

export function useOnboardingGroupFlow(): UseOnboardingGroupFlowReturn {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useUser();
  const setStep = useMutation(api.onboarding.setOnboardingStep);

  // Extract current path info
  const { currentGroup, currentStepId } = useMemo(() => {
    // Handle both old and new expo-router segment formats
    const isOnboardingRoute = segments.some(segment => segment === 'onboarding');
    const onboardingIndex = segments.findIndex(segment => segment === 'onboarding');

    if (isOnboardingRoute && onboardingIndex >= 0) {
      const groupSegment = segments[onboardingIndex + 1] as GroupKey | undefined;
      const stepSegment = segments[onboardingIndex + 2] || 'index';

      // Map URL segments to step IDs
      const stepMap: Record<string, string> = {
        index:
          groupSegment === 'profile'
            ? 'profile-type'
            : groupSegment === 'attributes'
              ? 'display-name'
              : groupSegment === 'work-details'
                ? 'headshots'
                : groupSegment === 'experiences'
                  ? 'projects'
                  : 'review',
        type: 'profile-type',
        resume: 'resume',
        general: 'review',
        experiences: 'projects-review',
        projects: 'projects',
      };

      return {
        currentGroup: groupSegment || null,
        currentStepId: groupSegment ? stepMap[stepSegment] || stepSegment : null,
      };
    }
    return { currentGroup: null, currentStepId: null };
  }, [segments]);

  // Determine active flow based on profile type
  const activeFlow = useMemo(() => {
    const profileType = user?.profileType as ProfileType | undefined;
    return profileType && ONBOARDING_GROUP_FLOWS[profileType]
      ? ONBOARDING_GROUP_FLOWS[profileType]
      : ONBOARDING_GROUP_FLOWS.dancer; // Default to dancer flow
  }, [user?.profileType]);

  // Calculate current positions
  const currentGroupIndex = useMemo(() => {
    return currentGroup ? activeFlow.indexOf(currentGroup) : 0;
  }, [activeFlow, currentGroup]);

  const currentStepInGroup = useMemo(() => {
    if (!currentGroup || !currentStepId) return 0;
    const groupConfig = ONBOARDING_GROUPS[currentGroup];
    if (!groupConfig) {
      console.warn(
        `Invalid onboarding group: ${currentGroup}. Available groups:`,
        Object.keys(ONBOARDING_GROUPS)
      );
      return 0;
    }
    return (groupConfig.steps as unknown as string[]).indexOf(currentStepId);
  }, [currentGroup, currentStepId]);

  // Progress calculations
  const getGroupProgress = useCallback(
    (groupKey: GroupKey): number => {
      const groupConfig = ONBOARDING_GROUPS[groupKey];

      // For now, return mock progress
      // In real implementation, this would check user data for completion
      if (groupKey === 'profile') return user?.profileType ? 100 : 50;
      if (groupKey === 'attributes') return user?.displayName ? 60 : 0;
      return 0;
    },
    [user]
  );

  const isGroupCompleted = useCallback(
    (groupKey: GroupKey): boolean => {
      return getGroupProgress(groupKey) === 100;
    },
    [getGroupProgress]
  );

  const groups = useMemo(() => {
    return activeFlow.map((groupKey) => ({
      key: groupKey,
      label: ONBOARDING_GROUPS[groupKey].label,
      completed: isGroupCompleted(groupKey),
      progress: getGroupProgress(groupKey),
      isActive: groupKey === currentGroup,
    }));
  }, [activeFlow, currentGroup, isGroupCompleted, getGroupProgress]);

  const groupProgress = useMemo(() => {
    return currentGroup ? getGroupProgress(currentGroup) : 0;
  }, [currentGroup, getGroupProgress]);

  const overallProgress = useMemo(() => {
    const totalGroups = activeFlow.length;
    const completedGroups = groups.filter((g) => g.completed).length;
    const currentGroupProgress = groupProgress / 100;

    return Math.round(((completedGroups + currentGroupProgress) / totalGroups) * 100);
  }, [activeFlow, groups, groupProgress]);

  // Navigation methods
  const navigateToNextStep = useCallback(() => {
    if (!currentGroup) return;

    const groupConfig = ONBOARDING_GROUPS[currentGroup];
    if (!groupConfig) {
      console.warn(`Cannot navigate: invalid group ${currentGroup}`);
      return;
    }
    const nextStepIndex = currentStepInGroup + 1;

    if (nextStepIndex < groupConfig.steps.length) {
      // Stay in current group
      const nextStepId = groupConfig.steps[nextStepIndex];
      navigateToStep(nextStepId);
    } else {
      // Move to next group
      navigateToNextGroup();
    }
  }, [currentGroup, currentStepInGroup]);

  const navigateToPreviousStep = useCallback(() => {
    if (!currentGroup) return;

    const groupConfig = ONBOARDING_GROUPS[currentGroup];
    if (!groupConfig) {
      console.warn(`Cannot navigate: invalid group ${currentGroup}`);
      return;
    }
    const prevStepIndex = currentStepInGroup - 1;

    if (prevStepIndex >= 0) {
      // Stay in current group
      const prevStepId = groupConfig.steps[prevStepIndex];
      navigateToStep(prevStepId);
    } else {
      // Move to previous group
      navigateToPreviousGroup();
    }
  }, [currentGroup, currentStepInGroup]);

  const navigateToNextGroup = useCallback(() => {
    const nextGroupIndex = currentGroupIndex + 1;
    if (nextGroupIndex < activeFlow.length) {
      const nextGroupKey = activeFlow[nextGroupIndex];
      navigateToGroup(nextGroupKey);
    }
  }, [currentGroupIndex, activeFlow]);

  const navigateToPreviousGroup = useCallback(() => {
    const prevGroupIndex = currentGroupIndex - 1;
    if (prevGroupIndex >= 0) {
      const prevGroupKey = activeFlow[prevGroupIndex];
      navigateToGroup(prevGroupKey);
    }
  }, [currentGroupIndex, activeFlow]);

  const navigateToGroup = useCallback(
    (groupKey: GroupKey) => {
      const groupConfig = ONBOARDING_GROUPS[groupKey];
      if (!groupConfig) {
        console.warn(`Cannot navigate to invalid group: ${groupKey}`);
        return;
      }

      // Navigate to the first step of the group
      if (groupConfig.steps && groupConfig.steps.length > 0) {
        const firstStep = groupConfig.steps[0];
        let path = groupConfig.basePath;

        // Handle routing for the first step of each group
        if (groupKey === 'profile' && (firstStep as any) === 'profile-type') {
          path += '/type';
        } else if (groupKey === 'profile' && (firstStep as any) === 'resume') {
          path += '/resume';
        } else if (groupKey === 'attributes') {
          // Attributes group uses individual routes for each step
          path += `/${firstStep}`;
        } else if (groupKey === 'work-details') {
          // Work-details group uses individual routes for each step
          path += `/${firstStep}`;
        } else if (groupKey === 'review' && (firstStep as any) === 'review') {
          path += '/general';
        } else if (groupKey === 'experiences' && (firstStep as any) === 'projects') {
          path += '/projects';
        } else if (groupKey === 'review' && (firstStep as any) === 'projects-review') {
          path += '/experiences';
        }

        router.push(path as Href);

        // Persist step for server-side redirect support
        setStep({ step: firstStep }).catch(() => {});
      } else {
        // Fallback to base path if no steps defined
        router.push(groupConfig.basePath as Href);
      }
    },
    [router, setStep]
  );

  const navigateToStep = useCallback(
    (stepId: string) => {
      // Find which group contains this step
      for (const [groupKey, groupConfig] of Object.entries(ONBOARDING_GROUPS)) {
        if ((groupConfig.steps as unknown as string[]).includes(stepId)) {
          let path = groupConfig.basePath;

          // Handle special routing cases
          if (groupKey === 'profile' && (stepId as any) === 'profile-type') {
            path += '/type';
          } else if (groupKey === 'profile' && (stepId as any) === 'resume') {
            path += '/resume';
          } else if (groupKey === 'attributes') {
            // Attributes group uses individual routes for each step
            path += `/${stepId}`;
          } else if (groupKey === 'work-details') {
            // Work-details group uses individual routes for each step
            path += `/${stepId}`;
          } else if (groupKey === 'review' && (stepId as any) === 'review') {
            path += '/general';
          } else if (groupKey === 'experiences' && (stepId as any) === 'projects') {
            path += '/projects';
          } else if (groupKey === 'review' && (stepId as any) === 'projects-review') {
            path += '/experiences';
          }

          router.push(path as Href);

          // Persist step for server-side redirect support
          setStep({ step: stepId }).catch(() => {});
          return;
        }
      }
    },
    [router, setStep]
  );

  return {
    // Current state
    currentGroup,
    currentStepInGroup,
    totalStepsInGroup:
      currentGroup && ONBOARDING_GROUPS[currentGroup]
        ? ONBOARDING_GROUPS[currentGroup].steps.length
        : 0,
    currentStepId,

    // Group-level state
    groupProgress,
    overallProgress,
    groups,

    // Navigation state
    canNavigateNext:
      currentStepInGroup <
        (currentGroup && ONBOARDING_GROUPS[currentGroup]
          ? ONBOARDING_GROUPS[currentGroup].steps.length - 1
          : 0) || currentGroupIndex < activeFlow.length - 1,
    canNavigatePrevious: currentStepInGroup > 0 || currentGroupIndex > 0,
    canNavigateToNextGroup: currentGroupIndex < activeFlow.length - 1,
    canNavigateToPreviousGroup: currentGroupIndex > 0,

    // Navigation methods
    navigateToNextStep,
    navigateToPreviousStep,
    navigateToNextGroup,
    navigateToPreviousGroup,
    navigateToGroup,
    navigateToStep,

    // Progress calculation
    getGroupProgress,
    isGroupCompleted,

    // Loading state
    isLoading: false,
  };
}
