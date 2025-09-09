import { useRouter, useSegments, useGlobalSearchParams, Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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

  // Conditional navigation state
  representationStatus: string | undefined;
  setRepresentationStatus: (status: string) => void;

  // Progress calculation
  getGroupProgress: (groupKey: GroupKey) => number;
  isGroupCompleted: (groupKey: GroupKey) => boolean;

  // Loading state
  isLoading: false;
}

export function useOnboardingGroupFlow(): UseOnboardingGroupFlowReturn {
  const router = useRouter();
  const segments = useSegments();
  const searchParams = useGlobalSearchParams<{ group?: string; step?: string }>();
  const { user } = useUser();
  const setStep = useMutation(api.onboarding.setOnboardingStep);

  // Simple React state for conditional navigation
  const [representationStatus, setRepresentationStatus] = useState<string>();

  // Simple skip logic
  const shouldSkipStep = useCallback(
    (stepId: string): boolean => {
      const profileType = user?.profileType as ProfileType | undefined;

      // Skip agency if not represented
      if (stepId === 'agency' && representationStatus !== 'represented') {
        return true;
      }

      // Skip guest-specific steps for non-guest users
      if ((stepId === 'database-use' || stepId === 'company') && profileType !== 'guest') {
        return true;
      }

      // Skip non-guest steps for guest users
      if (profileType === 'guest') {
        const guestSteps = ['profile-type', 'database-use', 'company', 'review'];
        if (!guestSteps.includes(stepId)) {
          return true;
        }
      }

      return false;
    },
    [representationStatus, user?.profileType]
  );

  // Extract current path info
  const { currentGroup, currentStepId } = useMemo(() => {
    if (segments.length >= 3 && segments[1] === 'onboarding') {
      // Handle dynamic routes - when segments contain brackets, use search params
      const groupSegment =
        segments[2] === '[group]' ? (searchParams.group as GroupKey) : (segments[2] as GroupKey);
      const stepSegment =
        segments[3] === '[step]' ? searchParams.step || 'index' : segments[3] || 'index';

      // For groups using dynamic routes, the step segment IS the step ID
      if (
        (groupSegment === 'attributes' ||
          groupSegment === 'work-details' ||
          groupSegment === 'profile' ||
          groupSegment === 'experiences') &&
        stepSegment !== 'index' &&
        segments[2] === '[group]'
      ) {
        return {
          currentGroup: groupSegment,
          currentStepId: stepSegment, // This is already the step ID like 'display-name'
        };
      }

      // Map URL segments to step IDs for explicit routes
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
        currentGroup: groupSegment,
        currentStepId: stepMap[stepSegment] || stepSegment,
      };
    }
    return { currentGroup: null, currentStepId: null };
  }, [segments, searchParams.group, searchParams.step]);

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

  // Get visible steps for current group (filtering out skipped ones)
  const visibleStepsInGroup = useMemo(() => {
    if (!currentGroup) return [];
    const groupConfig = ONBOARDING_GROUPS[currentGroup];
    if (!groupConfig) return [];

    return (groupConfig.steps as unknown as string[]).filter((stepId) => !shouldSkipStep(stepId));
  }, [currentGroup, shouldSkipStep]);

  const currentStepInGroup = useMemo(() => {
    if (!currentGroup || !currentStepId) return 0;
    // Find index within visible steps only
    return visibleStepsInGroup.indexOf(currentStepId);
  }, [currentGroup, currentStepId, visibleStepsInGroup]);

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

    // Find next non-skipped step
    let nextStepIndex = currentStepInGroup + 1;
    while (nextStepIndex < groupConfig.steps.length) {
      const nextStepId = groupConfig.steps[nextStepIndex];
      if (!shouldSkipStep(nextStepId)) {
        // Navigate immediately without waiting for DB
        navigateToStep(nextStepId);
        return;
      }
      nextStepIndex++;
    }

    // No more steps in this group, move to next group
    navigateToNextGroup();
  }, [currentGroup, currentStepInGroup, shouldSkipStep]);

  const navigateToPreviousStep = useCallback(() => {
    if (!currentGroup) return;

    const groupConfig = ONBOARDING_GROUPS[currentGroup];
    if (!groupConfig) {
      console.warn(`Cannot navigate: invalid group ${currentGroup}`);
      return;
    }

    // Find previous non-skipped step
    let prevStepIndex = currentStepInGroup - 1;
    while (prevStepIndex >= 0) {
      const prevStepId = groupConfig.steps[prevStepIndex];
      if (!shouldSkipStep(prevStepId)) {
        navigateToStep(prevStepId);
        return;
      }
      prevStepIndex--;
    }

    // No more steps in this group, move to previous group
    navigateToPreviousGroup();
  }, [currentGroup, currentStepInGroup, shouldSkipStep]);

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
        if (groupKey === 'profile' && firstStep === 'resume') {
          // Special case: resume has its own screen
          path += '/resume';
        } else if (groupKey === 'experiences' && firstStep === 'projects') {
          // Special case: projects has its own screen
          path += '/projects';
        } else if (
          groupKey === 'attributes' ||
          groupKey === 'work-details' ||
          (groupKey === 'experiences' && firstStep !== 'projects') ||
          (groupKey === 'profile' && firstStep !== 'resume')
        ) {
          // Use dynamic routing for other steps
          path = `/app/onboarding/${groupKey}/${firstStep}` as any;
        } else if (groupKey === 'review' && (firstStep as any) === 'review') {
          path += '/general';
        } else if (groupKey === 'review' && (firstStep as any) === 'projects-review') {
          path += '/experiences';
        }

        router.push(path as Href);

        // Persist step for server-side redirect support (fire-and-forget)
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
          if (groupKey === 'profile' && stepId === 'resume') {
            // Special case: resume has its own screen
            path += '/resume';
          } else if (groupKey === 'experiences' && stepId === 'projects') {
            // Special case: projects has its own screen
            path += '/projects';
          } else if (
            groupKey === 'attributes' ||
            groupKey === 'work-details' ||
            (groupKey === 'experiences' && stepId !== 'projects') ||
            (groupKey === 'profile' && stepId !== 'resume')
          ) {
            // Use dynamic routing for other steps
            path = `/app/onboarding/${groupKey}/${stepId}` as any;
          } else if (groupKey === 'review' && (stepId as any) === 'review') {
            path += '/general';
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
    totalStepsInGroup: visibleStepsInGroup.length,
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

    // Conditional navigation state
    representationStatus,
    setRepresentationStatus,

    // Progress calculation
    getGroupProgress,
    isGroupCompleted,

    // Loading state
    isLoading: false,
  };
}
