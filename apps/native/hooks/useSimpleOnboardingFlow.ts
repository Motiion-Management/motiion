import { useRouter, useSegments, Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useUser } from './useUser';

// Define the static flow structure with 5 sections
export const ONBOARDING_SECTIONS = {
  account: [], // Handled by create-account flow
  profile: ['profile-type', 'resume'],
  attributes: ['display-name', 'height', 'ethnicity', 'hair-color', 'eye-color', 'gender'],
  workDetails: [
    'headshots',
    'sizing',
    'location',
    'work-location',
    'representation',
    'agency',
    'training',
    'experiences',
    'skills',
    'union',
  ],
  review: ['review', 'complete'],
} as const;

export const ONBOARDING_FLOWS = {
  dancer: [
    // Profile section
    'profile-type',
    'resume',
    // Attributes section
    'display-name',
    'height',
    'ethnicity',
    'hair-color',
    'eye-color',
    'gender',
    // Work Details section
    'headshots',
    'sizing',
    'location',
    'work-location',
    'representation',
    'agency',
    'experiences',
    'training',
    'skills',
    'union',
    // Review section
    'review',
    'complete',
  ],
  choreographer: [
    // Profile section
    'profile-type',
    'resume',
    // Attributes section
    'display-name',
    // Work Details section
    'headshots',
    'location',
    'representation',
    'agency',
    'training',
    'experiences',
    // Review section
    'review',
    'complete',
  ],
  guest: [
    // Profile section
    'profile-type',
    'database-use',
    'company',
    // Review section
    'review',
    'complete',
  ],
} as const;

// Steps that are client-only and not tracked by backend setOnboardingStep
const DO_NOT_PERSIST_STEPS = new Set(['complete']);

type ProfileType = keyof typeof ONBOARDING_FLOWS;

// Section utilities
function getSectionForStep(stepId: string): keyof typeof ONBOARDING_SECTIONS | null {
  for (const [sectionName, steps] of Object.entries(ONBOARDING_SECTIONS)) {
    if ((steps as readonly string[]).includes(stepId)) {
      return sectionName as keyof typeof ONBOARDING_SECTIONS;
    }
  }
  return null;
}

function getSectionLabel(sectionName: keyof typeof ONBOARDING_SECTIONS): string {
  const labels = {
    account: 'ACCOUNT',
    profile: 'PROFILE',
    attributes: 'ATTRIBUTES',
    workDetails: 'WORK DETAILS',
    review: 'REVIEW INFO',
  };
  return labels[sectionName];
}

interface UseSimpleOnboardingFlowReturn {
  // Current state
  currentStepId: string | null;
  currentIndex: number;
  totalSteps: number;

  // Section state
  currentSection: keyof typeof ONBOARDING_SECTIONS | null;
  currentSectionLabel: string;

  // Navigation state
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStepPath: string | null;
  previousStepPath: string | null;

  // Progress
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Navigation methods
  navigateNext: () => void;
  navigatePrevious: () => void;
  navigateToStep: (stepId: string) => void;

  // Loading state (always false for static flow)
  isLoading: false;
}

export function useSimpleOnboardingFlow(): UseSimpleOnboardingFlowReturn {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useUser();
  const setStep = useMutation(api.onboarding.setOnboardingStep);

  // Extract current step from URL
  const currentStepId = useMemo(() => {
    if (segments.length >= 3 && segments[1] === 'onboarding') {
      return segments[2] as (typeof ONBOARDING_FLOWS)[keyof typeof ONBOARDING_FLOWS][number] | null;
    }
    return null;
  }, [segments]);

  // Determine which flow to use based on profile type or current step
  const baseFlow = useMemo(() => {
    // If we're on profile-type, we don't know the flow yet
    if (currentStepId === 'profile-type') {
      // Default to dancer flow since all flows start with profile-type
      return ONBOARDING_FLOWS.dancer;
    }

    // Use the user's profile type if available
    const profileType = user?.profileType as ProfileType | undefined;
    if (profileType && ONBOARDING_FLOWS[profileType]) {
      return ONBOARDING_FLOWS[profileType];
    }

    // Try to infer from current step
    if (currentStepId) {
      return [currentStepId, 'profile-type'];
    }

    // Default to dancer flow
    return ONBOARDING_FLOWS.dancer;
  }, [currentStepId, user?.profileType]);

  // Filter out steps that can be skipped based on resume import
  const activeFlow = useMemo(() => {
    const resumeImportedFields = user?.resumeImportedFields || [];

    // Steps that can be skipped if data was imported from resume
    const skippableSteps = {
      experiences: resumeImportedFields.includes('experiences'),
      training: resumeImportedFields.includes('training'),
      skills: resumeImportedFields.includes('skills'),
      union: resumeImportedFields.includes('sagAftraId'),
    };

    // Always show these steps regardless of resume import
    const alwaysShowSteps = new Set([
      'profile-type',
      'resume',
      'headshots',
      'sizing',
      'location',
      'review',
      'complete',
    ]);

    return baseFlow.filter(
      (step) => alwaysShowSteps.has(step) || !skippableSteps[step as keyof typeof skippableSteps]
    );
  }, [baseFlow, user?.resumeImportedFields]);

  // Calculate current index
  const currentIndex = useMemo(() => {
    if (!currentStepId) return 0;
    // @ts-ignore
    const index = activeFlow.indexOf(currentStepId);
    return index >= 0 ? index : 0;
  }, [activeFlow, currentStepId]);

  // Calculate current section
  const { currentSection, currentSectionLabel } = useMemo(() => {
    const section = currentStepId ? getSectionForStep(currentStepId) : null;
    const label = section ? getSectionLabel(section) : 'PROFILE';
    return { currentSection: section, currentSectionLabel: label };
  }, [currentStepId]);

  // Calculate navigation targets
  const { nextStepPath, previousStepPath, nextStepId, previousStepId } = useMemo(() => {
    let nextPath: string | null = null;
    let prevPath: string | null = null;
    let nextId: string | null = null;
    let prevId: string | null = null;

    // Handle profile-type decision navigation
    if (currentStepId === 'profile-type' && user?.profileType) {
      const profileType = user.profileType as ProfileType;
      const targetFlow = ONBOARDING_FLOWS[profileType];
      if (targetFlow && targetFlow.length > 1) {
        nextId = targetFlow[1];
        nextPath = `/app/onboarding/${nextId}`;
      }
    } else if (currentStepId === 'representation' && user?.representationStatus !== 'represented') {
      // Skip agency step if already represented
      nextId = activeFlow[currentIndex + 2] ?? null;
      nextPath = nextId ? `/app/onboarding/${nextId}` : null;
    } else if (currentIndex < activeFlow.length - 1) {
      nextId = activeFlow[currentIndex + 1] ?? null;
      nextPath = nextId ? `/app/onboarding/${nextId}` : null;
    }

    if (currentIndex > 0) {
      prevId = activeFlow[currentIndex - 1] ?? null;
      prevPath = prevId ? `/app/onboarding/${prevId}` : null;
    }

    if (user?.representationStatus !== 'represented' && prevPath === '/app/onboarding/agency') {
      // Skip agency step if already represented
      prevId = 'representation';
      prevPath = `/app/onboarding/representation`;
    }

    return {
      nextStepPath: nextPath,
      previousStepPath: prevPath,
      nextStepId: nextId,
      previousStepId: prevId,
    };
  }, [currentStepId, currentIndex, activeFlow, user?.profileType]);

  // Calculate progress
  const progress = useMemo(() => {
    if (activeFlow.length <= 1) return 100;
    return Math.round((currentIndex / (activeFlow.length - 1)) * 100);
  }, [currentIndex, activeFlow]);

  // Navigation methods
  const navigateNext = useCallback(() => {
    if (nextStepPath && nextStepId) {
      router.push(nextStepPath as Href);
      // Persist navigation position for server-side redirect support (fire-and-forget)
      if (!DO_NOT_PERSIST_STEPS.has(nextStepId)) {
        setStep({ step: nextStepId }).catch(() => {});
      }
    }
  }, [nextStepPath, nextStepId, router, setStep]);

  const navigatePrevious = useCallback(() => {
    if (previousStepPath && previousStepId) {
      router.push(previousStepPath as Href);
      if (!DO_NOT_PERSIST_STEPS.has(previousStepId)) {
        setStep({ step: previousStepId }).catch(() => {});
      }
    }
  }, [previousStepPath, previousStepId, router, setStep]);

  const navigateToStep = useCallback(
    (stepId: string) => {
      router.push(`/app/onboarding/${stepId}` as Href);
      if (!DO_NOT_PERSIST_STEPS.has(stepId)) {
        setStep({ step: stepId }).catch(() => {});
      }
    },
    [router, setStep]
  );

  return {
    // Current state
    currentStepId,
    currentIndex,
    totalSteps: activeFlow.length,

    // Section state
    currentSection,
    currentSectionLabel,

    // Navigation state
    canGoNext: !!nextStepPath,
    canGoPrevious: !!previousStepPath,
    nextStepPath,
    previousStepPath,

    // Progress
    progress,
    isFirstStep: currentIndex === 0,
    isLastStep: currentIndex === activeFlow.length - 1,

    // Navigation methods
    navigateNext,
    navigatePrevious,
    navigateToStep,

    // Loading state
    isLoading: false,
  };
}
