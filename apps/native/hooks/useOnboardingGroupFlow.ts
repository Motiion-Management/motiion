import { useRouter, useSegments, Href } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'
import { useUser } from './useUser'

// Define the group-based flow structure
export const ONBOARDING_GROUPS = {
  profile: {
    key: 'profile',
    label: 'Profile',
    steps: ['profile-type', 'resume'],
    basePath: '/app/onboarding/profile',
  },
  attributes: {
    key: 'attributes', 
    label: 'Attributes',
    steps: ['display-name', 'height', 'ethnicity', 'hair-color', 'eye-color', 'gender'],
    basePath: '/app/onboarding/attributes',
  },
  'work-details': {
    key: 'work-details',
    label: 'Work',
    steps: ['headshots', 'sizing', 'location', 'work-location', 'representation', 'agency', 'training', 'skills'],
    basePath: '/app/onboarding/work-details',
  },
  experiences: {
    key: 'experiences',
    label: 'Experience', 
    steps: ['experiences'],
    basePath: '/app/onboarding/experiences',
  },
  review: {
    key: 'review',
    label: 'Review',
    steps: ['review', 'experiences-review'],
    basePath: '/app/onboarding/review',
  },
} as const

export type GroupKey = keyof typeof ONBOARDING_GROUPS
export type GroupConfig = typeof ONBOARDING_GROUPS[GroupKey]

// Define flows based on profile type
export const ONBOARDING_GROUP_FLOWS = {
  dancer: ['profile', 'attributes', 'work-details', 'experiences', 'review'] as GroupKey[],
  choreographer: ['profile', 'attributes', 'work-details', 'experiences', 'review'] as GroupKey[], // Simplified for choreographers
  guest: ['profile', 'review'] as GroupKey[], // Minimal flow for guests
} as const

type ProfileType = keyof typeof ONBOARDING_GROUP_FLOWS

interface UseOnboardingGroupFlowReturn {
  // Current state
  currentGroup: GroupKey | null
  currentStepInGroup: number
  totalStepsInGroup: number
  currentStepId: string | null
  
  // Group-level state
  groupProgress: number // Progress within current group (0-100)
  overallProgress: number // Progress across all groups (0-100)
  groups: Array<{
    key: GroupKey
    label: string
    completed: boolean
    progress: number
    isActive: boolean
  }>
  
  // Navigation state
  canNavigateNext: boolean
  canNavigatePrevious: boolean
  canNavigateToNextGroup: boolean
  canNavigateToPreviousGroup: boolean
  
  // Navigation methods
  navigateToNextStep: () => void
  navigateToPreviousStep: () => void
  navigateToNextGroup: () => void
  navigateToPreviousGroup: () => void
  navigateToGroup: (group: GroupKey) => void
  navigateToStep: (stepId: string) => void
  
  // Progress calculation
  getGroupProgress: (groupKey: GroupKey) => number
  isGroupCompleted: (groupKey: GroupKey) => boolean
  
  // Loading state
  isLoading: false
}

export function useOnboardingGroupFlow(): UseOnboardingGroupFlowReturn {
  const router = useRouter()
  const segments = useSegments()
  const { user } = useUser()
  const setStep = useMutation(api.onboarding.setOnboardingStep)

  // Extract current path info
  const { currentGroup, currentStepId } = useMemo(() => {
    if (segments.length >= 3 && segments[1] === 'onboarding') {
      const groupSegment = segments[2] as GroupKey
      const stepSegment = segments[3] || 'index'
      
      // Map URL segments to step IDs
      const stepMap: Record<string, string> = {
        'index': groupSegment === 'profile' ? 'profile-type' : 
                 groupSegment === 'attributes' ? 'display-name' :
                 groupSegment === 'work-details' ? 'headshots' :
                 groupSegment === 'experiences' ? 'experiences' :
                 'review',
        'type': 'profile-type',
        'resume': 'resume',
        'general': 'review',
        'experiences': 'experiences-review',
      }
      
      return {
        currentGroup: groupSegment,
        currentStepId: stepMap[stepSegment] || stepSegment,
      }
    }
    return { currentGroup: null, currentStepId: null }
  }, [segments])

  // Determine active flow based on profile type
  const activeFlow = useMemo(() => {
    const profileType = user?.profileType as ProfileType | undefined
    return profileType && ONBOARDING_GROUP_FLOWS[profileType] 
      ? ONBOARDING_GROUP_FLOWS[profileType]
      : ONBOARDING_GROUP_FLOWS.dancer // Default to dancer flow
  }, [user?.profileType])

  // Calculate current positions
  const currentGroupIndex = useMemo(() => {
    return currentGroup ? activeFlow.indexOf(currentGroup) : 0
  }, [activeFlow, currentGroup])

  const currentStepInGroup = useMemo(() => {
    if (!currentGroup || !currentStepId) return 0
    const groupConfig = ONBOARDING_GROUPS[currentGroup]
    return (groupConfig.steps as unknown as string[]).indexOf(currentStepId)
  }, [currentGroup, currentStepId])

  // Progress calculations
  const getGroupProgress = useCallback((groupKey: GroupKey): number => {
    const groupConfig = ONBOARDING_GROUPS[groupKey]
    
    // For now, return mock progress
    // In real implementation, this would check user data for completion
    if (groupKey === 'profile') return user?.profileType ? 100 : 50
    if (groupKey === 'attributes') return user?.displayName ? 60 : 0
    return 0
  }, [user])

  const isGroupCompleted = useCallback((groupKey: GroupKey): boolean => {
    return getGroupProgress(groupKey) === 100
  }, [getGroupProgress])

  const groups = useMemo(() => {
    return activeFlow.map(groupKey => ({
      key: groupKey,
      label: ONBOARDING_GROUPS[groupKey].label,
      completed: isGroupCompleted(groupKey),
      progress: getGroupProgress(groupKey),
      isActive: groupKey === currentGroup,
    }))
  }, [activeFlow, currentGroup, isGroupCompleted, getGroupProgress])

  const groupProgress = useMemo(() => {
    return currentGroup ? getGroupProgress(currentGroup) : 0
  }, [currentGroup, getGroupProgress])

  const overallProgress = useMemo(() => {
    const totalGroups = activeFlow.length
    const completedGroups = groups.filter(g => g.completed).length
    const currentGroupProgress = groupProgress / 100
    
    return Math.round(((completedGroups + currentGroupProgress) / totalGroups) * 100)
  }, [activeFlow, groups, groupProgress])

  // Navigation methods
  const navigateToNextStep = useCallback(() => {
    if (!currentGroup) return
    
    const groupConfig = ONBOARDING_GROUPS[currentGroup]
    const nextStepIndex = currentStepInGroup + 1
    
    if (nextStepIndex < groupConfig.steps.length) {
      // Stay in current group
      const nextStepId = groupConfig.steps[nextStepIndex]
      navigateToStep(nextStepId)
    } else {
      // Move to next group
      navigateToNextGroup()
    }
  }, [currentGroup, currentStepInGroup])

  const navigateToPreviousStep = useCallback(() => {
    if (!currentGroup) return
    
    const groupConfig = ONBOARDING_GROUPS[currentGroup]
    const prevStepIndex = currentStepInGroup - 1
    
    if (prevStepIndex >= 0) {
      // Stay in current group
      const prevStepId = groupConfig.steps[prevStepIndex]
      navigateToStep(prevStepId)
    } else {
      // Move to previous group
      navigateToPreviousGroup()
    }
  }, [currentGroup, currentStepInGroup])

  const navigateToNextGroup = useCallback(() => {
    const nextGroupIndex = currentGroupIndex + 1
    if (nextGroupIndex < activeFlow.length) {
      const nextGroupKey = activeFlow[nextGroupIndex]
      navigateToGroup(nextGroupKey)
    }
  }, [currentGroupIndex, activeFlow])

  const navigateToPreviousGroup = useCallback(() => {
    const prevGroupIndex = currentGroupIndex - 1
    if (prevGroupIndex >= 0) {
      const prevGroupKey = activeFlow[prevGroupIndex]
      navigateToGroup(prevGroupKey)
    }
  }, [currentGroupIndex, activeFlow])

  const navigateToGroup = useCallback((groupKey: GroupKey) => {
    const groupConfig = ONBOARDING_GROUPS[groupKey]
    router.push(groupConfig.basePath as Href)
  }, [router])

  const navigateToStep = useCallback((stepId: string) => {
    // Find which group contains this step
    for (const [groupKey, groupConfig] of Object.entries(ONBOARDING_GROUPS)) {
      if ((groupConfig.steps as unknown as string[]).includes(stepId)) {
        let path = groupConfig.basePath
        
        // Handle special routing cases
        if (groupKey === 'profile' && stepId === 'profile-type') {
          path += '/type'
        } else if (groupKey === 'profile' && stepId === 'resume') {
          path += '/resume'
        } else if (groupKey === 'review' && stepId === 'review') {
          path += '/general'
        } else if (groupKey === 'review' && stepId === 'experiences-review') {
          path += '/experiences'
        }
        
        router.push(path as Href)
        
        // Persist step for server-side redirect support
        setStep({ step: stepId }).catch(() => {})
        return
      }
    }
  }, [router, setStep])

  return {
    // Current state
    currentGroup,
    currentStepInGroup,
    totalStepsInGroup: currentGroup ? ONBOARDING_GROUPS[currentGroup].steps.length : 0,
    currentStepId,
    
    // Group-level state
    groupProgress,
    overallProgress,
    groups,
    
    // Navigation state
    canNavigateNext: currentStepInGroup < (currentGroup ? ONBOARDING_GROUPS[currentGroup].steps.length - 1 : 0) || 
                    currentGroupIndex < activeFlow.length - 1,
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
  }
}