import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { perfLog, trackQuery } from '~/utils/performanceDebug';

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
  branches: Array<{ value: string; nextStep: string }>;
}

export interface OnboardingFlow {
  steps: OnboardingStep[];
  decisionPoints: DecisionPoint[];
  version: string;
}

interface OnboardingFlowHelpers {
  getStep: (stepId: string) => OnboardingStep | undefined;
  getStepRoute: (stepId: string) => string | undefined;
  getStepIdFromRoute: (route: string) => string | undefined;
  getStepIndex: (stepId: string) => number;
  getNextStep: (currentStepId: string, userData: Record<string, any>) => OnboardingStep | null;
  getPreviousStep: (currentStepId: string) => OnboardingStep | null;
  isStepVisible: (step: OnboardingStep, userData: Record<string, any>) => boolean;
  getVisibleSteps: (userData: Record<string, any>) => OnboardingStep[];
  calculateProgress: (currentStepId: string, userData: Record<string, any>) => number;
}

interface OnboardingFlowContextValue extends OnboardingFlowHelpers {
  flow: OnboardingFlow | null;
  isLoading: boolean;
}

const OnboardingFlowContext = createContext<OnboardingFlowContextValue | undefined>(undefined);

export function OnboardingFlowProvider({
  children,
  version = 'v2',
}: {
  children: ReactNode;
  version?: string;
}) {
  // Make the query once at the provider level
  const flowData = useQuery(api.onboardingFlows.getUserFlow, { version });
  const isLoading = flowData === undefined;

  // Log query performance once
  useEffect(() => {
    if (isLoading) {
      trackQuery.start('getUserFlow', { version, provider: true });
    } else {
      const stepCount = flowData && !Array.isArray(flowData) ? flowData.steps?.length : 0;
      const hasDecisionPoints =
        flowData && !Array.isArray(flowData) && !!flowData.decisionPoints?.length;

      trackQuery.complete('getUserFlow', stepCount);
      perfLog('flow:loaded:provider', {
        version,
        stepCount,
        hasDecisionPoints,
      });
    }
  }, [isLoading, flowData, version]);

  // Process and memoize the flow data
  const flow = useMemo<OnboardingFlow | null>(() => {
    if (!flowData) {
      return null;
    }

    // Handle empty array response (no user or no flow found)
    if (Array.isArray(flowData)) {
      return {
        steps: [],
        decisionPoints: [],
        version,
      };
    }

    // Handle the expected object response with steps and decisionPoints
    if (flowData.steps) {
      return {
        steps: flowData.steps,
        decisionPoints: flowData.decisionPoints || [],
        version: flowData.version || version,
      };
    }

    return null;
  }, [flowData, version]);

  // Helper functions for flow navigation
  const helpers = useMemo<OnboardingFlowHelpers>(() => {
    const getStep = (stepId: string): OnboardingStep | undefined => {
      return flow?.steps.find((step) => step.id === stepId);
    };

    const getStepRoute = (stepId: string): string | undefined => {
      return flow?.steps.find((step) => step.id === stepId)?.route;
    };

    const getStepIdFromRoute = (route: string): string | undefined => {
      // Extract the last segment from the route
      const segments = route.split('/');
      const lastSegment = segments[segments.length - 1];
      return flow?.steps.find((step) => step.route.endsWith(lastSegment))?.id;
    };

    const getStepIndex = (stepId: string): number => {
      return flow?.steps.findIndex((step) => step.id === stepId) ?? -1;
    };

    const getNextStep = (
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
    };

    const getPreviousStep = (currentStepId: string): OnboardingStep | null => {
      if (!flow) return null;

      const currentIndex = flow.steps.findIndex((step) => step.id === currentStepId);
      if (currentIndex <= 0) return null;

      return flow.steps[currentIndex - 1];
    };

    const isStepVisible = (step: OnboardingStep, userData: Record<string, any>): boolean => {
      if (!step.conditional) return true;

      const fieldValue = userData[step.conditional.field];
      return fieldValue === step.conditional.value ? step.conditional.show : !step.conditional.show;
    };

    const getVisibleSteps = (userData: Record<string, any>): OnboardingStep[] => {
      if (!flow) return [];
      return flow.steps.filter((step) => isStepVisible(step, userData));
    };

    const calculateProgress = (currentStepId: string, userData: Record<string, any>): number => {
      const visibleSteps = getVisibleSteps(userData);
      const currentIndex = visibleSteps.findIndex((step) => step.id === currentStepId);
      if (currentIndex === -1 || visibleSteps.length === 0) return 0;
      return Math.round((currentIndex / visibleSteps.length) * 100);
    };

    return {
      getStep,
      getStepRoute,
      getStepIdFromRoute,
      getStepIndex,
      getNextStep,
      getPreviousStep,
      isStepVisible,
      getVisibleSteps,
      calculateProgress,
    };
  }, [flow]);

  const value = useMemo<OnboardingFlowContextValue>(
    () => ({
      flow,
      isLoading,
      ...helpers,
    }),
    [flow, isLoading, helpers]
  );

  return <OnboardingFlowContext.Provider value={value}>{children}</OnboardingFlowContext.Provider>;
}

export function useSharedOnboardingFlow() {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error('useSharedOnboardingFlow must be used within OnboardingFlowProvider');
  }
  return context;
}

// Export for backward compatibility - redirects to shared version
export function useOnboardingFlow() {
  return useSharedOnboardingFlow();
}
