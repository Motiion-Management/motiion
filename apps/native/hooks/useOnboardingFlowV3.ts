import { api } from '@packages/backend/convex/_generated/api'
import { useQuery } from 'convex/react'
import { useRouter, useSegments, Href } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { type OnboardingStepV3, type OnboardingFlowV3 } from '@packages/backend/convex/validators/onboardingFlowsV3'
import { useUser } from './useUser'

interface NavigationResult {
  path: string
  shouldAutoSubmit: boolean
  submitDelay?: number
}

interface UseOnboardingFlowV3Return {
  // Flow data
  flow: OnboardingFlowV3 | null
  currentStep: OnboardingStepV3 | null
  currentStepId: string | null
  
  // Navigation state (pre-calculated)
  canGoNext: boolean
  canGoPrevious: boolean
  nextStepPath: string | null
  previousStepPath: string | null
  
  // Progress
  progress: number
  currentIndex: number
  totalSteps: number
  
  // Navigation methods
  navigateNext: () => void
  navigatePrevious: () => void
  navigateToStep: (stepId: string) => void
  
  // UI helpers
  isFirstStep: boolean
  isLastStep: boolean
  isDecisionStep: boolean
  
  // Loading state
  isLoading: boolean
}

/**
 * Simplified onboarding flow hook for V3 architecture
 * - Flow is fetched once and cached
 * - Navigation is pre-calculated on load
 * - No complex synchronization with backend
 */
export function useOnboardingFlowV3(): UseOnboardingFlowV3Return {
  const router = useRouter()
  const segments = useSegments()
  const { user } = useUser()
  
  // Fetch the complete flow once
  const profileType = user?.profileType || 'dancer'
  const flow = useQuery(api.onboardingFlowsV3.getActiveFlowV3, { profileType })
  
  // Extract current step from URL
  const currentStepId = useMemo(() => {
    if (segments.length >= 3 && segments[1] === 'onboarding') {
      return segments[2] // e.g., 'hair-color'
    }
    return null
  }, [segments])
  
  // Get current step data
  const currentStep = useMemo(() => {
    if (!flow || !currentStepId) return null
    return flow.steps[currentStepId] || null
  }, [flow, currentStepId])
  
  // Calculate current index
  const { currentIndex, totalSteps } = useMemo(() => {
    if (!flow) return { currentIndex: 0, totalSteps: 0 }
    
    const stepIds = Object.keys(flow.steps)
    const index = stepIds.findIndex(id => id === currentStepId)
    
    return {
      currentIndex: index >= 0 ? index : 0,
      totalSteps: stepIds.length
    }
  }, [flow, currentStepId])
  
  // Pre-calculate navigation paths based on current step
  const { nextStepPath, previousStepPath, canGoNext, canGoPrevious } = useMemo(() => {
    if (!currentStep || !flow) {
      return {
        nextStepPath: null,
        previousStepPath: null,
        canGoNext: false,
        canGoPrevious: false
      }
    }
    
    let nextPath: string | null = null
    let prevPath: string | null = null
    
    // Handle decision steps
    if (currentStep.type === 'decision' && currentStep.decisionNavigation) {
      // For decision steps, we need the field value to determine next step
      // This will be handled by the form submission
      // For now, we'll use the default if available
      const defaultNext = currentStep.decisionNavigation.defaultNext
      if (defaultNext && flow.steps[defaultNext]) {
        nextPath = flow.steps[defaultNext].path
      }
    } else if (currentStep.nextStep && flow.steps[currentStep.nextStep]) {
      // Simple step navigation
      nextPath = flow.steps[currentStep.nextStep].path
    }
    
    // Previous is always simple
    if (currentStep.previousStep && flow.steps[currentStep.previousStep]) {
      prevPath = flow.steps[currentStep.previousStep].path
    }
    
    return {
      nextStepPath: nextPath,
      previousStepPath: prevPath,
      canGoNext: !!nextPath,
      canGoPrevious: !!prevPath
    }
  }, [currentStep, flow])
  
  // Calculate progress
  const progress = useMemo(() => {
    if (totalSteps === 0) return 0
    return Math.round((currentIndex / (totalSteps - 1)) * 100)
  }, [currentIndex, totalSteps])
  
  // Navigation methods
  const navigateNext = useCallback(() => {
    if (nextStepPath) {
      router.push(nextStepPath as Href)
    }
  }, [nextStepPath, router])
  
  const navigatePrevious = useCallback(() => {
    if (previousStepPath) {
      router.push(previousStepPath as Href)
    }
  }, [previousStepPath, router])
  
  const navigateToStep = useCallback((stepId: string) => {
    if (!flow || !flow.steps[stepId]) return
    router.push(flow.steps[stepId].path as Href)
  }, [flow, router])
  
  // Helper methods for decision navigation
  const getDecisionPath = useCallback((fieldValue: string): string | null => {
    if (!currentStep || currentStep.type !== 'decision' || !currentStep.decisionNavigation) {
      return null
    }
    
    const branch = currentStep.decisionNavigation.branches.find(
      b => b.value === fieldValue
    )
    
    if (branch && flow?.steps[branch.nextStep]) {
      return flow.steps[branch.nextStep].path
    }
    
    // Fall back to default
    const defaultNext = currentStep.decisionNavigation.defaultNext
    if (defaultNext && flow?.steps[defaultNext]) {
      return flow.steps[defaultNext].path
    }
    
    return null
  }, [currentStep, flow])
  
  // UI helpers
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === totalSteps - 1
  const isDecisionStep = currentStep?.type === 'decision'
  
  return {
    // Flow data
    flow,
    currentStep,
    currentStepId,
    
    // Navigation state
    canGoNext,
    canGoPrevious,
    nextStepPath,
    previousStepPath,
    
    // Progress
    progress,
    currentIndex,
    totalSteps,
    
    // Navigation methods
    navigateNext,
    navigatePrevious,
    navigateToStep,
    
    // UI helpers
    isFirstStep,
    isLastStep,
    isDecisionStep,
    
    // Loading state
    isLoading: !flow
  }
}

/**
 * Hook for handling decision-based navigation
 * Use this in decision steps to navigate based on field values
 */
export function useDecisionNavigation() {
  const { currentStep, flow } = useOnboardingFlowV3()
  const router = useRouter()
  
  const navigateBasedOnDecision = useCallback((fieldValue: string) => {
    if (!currentStep || currentStep.type !== 'decision' || !currentStep.decisionNavigation || !flow) {
      console.warn('navigateBasedOnDecision called on non-decision step')
      return
    }
    
    // Find the matching branch
    const branch = currentStep.decisionNavigation.branches.find(
      b => b.value === fieldValue
    )
    
    let nextStepId: string | undefined
    
    if (branch) {
      nextStepId = branch.nextStep
    } else {
      // Use default if no branch matches
      nextStepId = currentStep.decisionNavigation.defaultNext
    }
    
    if (nextStepId && flow.steps[nextStepId]) {
      router.push(flow.steps[nextStepId].path as Href)
    } else {
      console.error('No valid next step found for decision value:', fieldValue)
    }
  }, [currentStep, flow, router])
  
  return {
    navigateBasedOnDecision,
    isDecisionStep: currentStep?.type === 'decision',
    decisionField: currentStep?.decisionNavigation?.field
  }
}