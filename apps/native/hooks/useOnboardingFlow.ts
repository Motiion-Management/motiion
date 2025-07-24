import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useMemo } from 'react';

export interface OnboardingStep {
  id: string;
  name: string;
  route: string;
  required: string[];
  minItems?: number;
  description?: string;
  conditional?: {
    field: string;
    value: string;
    show: boolean;
  };
  validation?: {
    type: 'backend' | 'local';
    endpoint?: string;
  };
}

export interface DecisionPoint {
  stepId: string;
  field: string;
  branches: Array<{
    value: string;
    nextStep: string;
  }>;
}

export interface OnboardingFlow {
  steps: OnboardingStep[];
  decisionPoints: DecisionPoint[];
  version: string;
}

/**
 * Hook to fetch and cache the onboarding flow configuration
 * This replaces hardcoded flow constants with dynamic server-driven data
 */
export function useOnboardingFlow(version = 'v2') {
  // Fetch the user-specific flow (filtered based on their choices)
  const flowData = useQuery(api.onboardingFlows.getUserFlow, { version });

  // Process and memoize the flow data
  const flow = useMemo<OnboardingFlow | null>(() => {
    if (!flowData) {
      return null;
    }

    // Handle the expected object response with steps and decisionPoints
    if (!Array.isArray(flowData) && flowData.steps) {
      return flowData as OnboardingFlow;
    }

    // Handle legacy array response (backward compatibility)
    if (Array.isArray(flowData)) {
      return {
        steps: [],
        decisionPoints: [],
        version,
      };
    }

    return null;
  }, [flowData, version]);

  // Helper functions for flow navigation
  const helpers = useMemo(
    () => ({
      /**
       * Get a step by its ID
       */
      getStep: (stepId: string): OnboardingStep | undefined => {
        return flow?.steps.find((step) => step.id === stepId);
      },

      /**
       * Get the route for a step ID
       */
      getStepRoute: (stepId: string): string | undefined => {
        return flow?.steps.find((step) => step.id === stepId)?.route;
      },

      /**
       * Get step ID from route
       */
      getStepIdFromRoute: (route: string): string | undefined => {
        // Extract the last segment from the route
        const segments = route.split('/');
        const lastSegment = segments[segments.length - 1];
        return flow?.steps.find((step) => step.route.endsWith(lastSegment))?.id;
      },

      /**
       * Get the index of a step
       */
      getStepIndex: (stepId: string): number => {
        return flow?.steps.findIndex((step) => step.id === stepId) ?? -1;
      },

      /**
       * Get the next step considering decision points
       */
      getNextStep: (
        currentStepId: string,
        userData: Record<string, any>
      ): OnboardingStep | null => {
        if (!flow) return null;

        const currentIndex = flow.steps.findIndex((step) => step.id === currentStepId);
        if (currentIndex === -1) return null;

        // Check if there's a decision point for this step
        const decisionPoint = flow.decisionPoints.find((dp) => dp.stepId === currentStepId);
        if (decisionPoint) {
          const fieldValue = userData[decisionPoint.field];
          const branch = decisionPoint.branches.find((b) => b.value === fieldValue);
          if (branch) {
            return flow.steps.find((step) => step.id === branch.nextStep) || null;
          }
        }

        // Return the next step in sequence
        return flow.steps[currentIndex + 1] || null;
      },

      /**
       * Get the previous visible step
       */
      getPreviousStep: (currentStepId: string): OnboardingStep | null => {
        if (!flow) return null;

        const currentIndex = flow.steps.findIndex((step) => step.id === currentStepId);
        if (currentIndex <= 0) return null;

        return flow.steps[currentIndex - 1];
      },

      /**
       * Check if a step should be visible based on conditionals
       */
      isStepVisible: (step: OnboardingStep, userData: Record<string, any>): boolean => {
        if (!step.conditional) return true;

        const fieldValue = userData[step.conditional.field];
        return fieldValue === step.conditional.value
          ? step.conditional.show
          : !step.conditional.show;
      },

      /**
       * Get all visible steps for progress calculation
       */
      getVisibleSteps: (userData: Record<string, any>): OnboardingStep[] => {
        if (!flow) return [];
        return flow.steps.filter((step) => helpers.isStepVisible(step, userData));
      },

      /**
       * Calculate progress based on visible steps
       */
      calculateProgress: (currentStepId: string, userData: Record<string, any>): number => {
        const visibleSteps = helpers.getVisibleSteps(userData);
        const currentIndex = visibleSteps.findIndex((step) => step.id === currentStepId);
        if (currentIndex === -1 || visibleSteps.length === 0) return 0;
        return Math.round((currentIndex / visibleSteps.length) * 100);
      },
    }),
    [flow]
  );

  return {
    flow,
    isLoading: flowData === undefined,
    ...helpers,
  };
}
