import { Doc } from './_generated/dataModel'
import {
  getOnboardingFlow,
  OnboardingStep,
  ProfileType,
  CURRENT_ONBOARDING_VERSION,
  getStepRoute
} from './onboardingConfig'

export interface OnboardingStatus {
  isComplete: boolean
  currentStep: string | null
  currentStepIndex: number
  totalSteps: number
  progress: number
  nextRequiredFields: string[]
  version: string
  missingFields: string[]
  stepDescription?: string
  redirectPath?: string
}

export function analyzeOnboardingProgress(
  user: Doc<'users'>,
  version: string = CURRENT_ONBOARDING_VERSION
): OnboardingStatus {
  // Safety check - ensure user object exists
  if (!user) {
    console.error('analyzeOnboardingProgress called with null/undefined user')
    return {
      isComplete: false,
      currentStep: 'profile-type',
      currentStepIndex: 0,
      totalSteps: 1,
      progress: 0,
      nextRequiredFields: ['profileType'],
      version,
      missingFields: ['profileType'],
      stepDescription: 'Select your profile type',
      redirectPath: '/(app)/onboarding/profile-type'
    }
  }

  // If user has completed onboarding in any version, they're done
  if (user.onboardingCompleted) {
    const profileType = user.profileType || 'dancer'
    const flow = getOnboardingFlow(profileType as ProfileType, version)

    return {
      isComplete: true,
      currentStep: null,
      currentStepIndex: flow.length,
      totalSteps: flow.length,
      progress: 100,
      nextRequiredFields: [],
      version: user.onboardingVersion || version,
      missingFields: [],
      redirectPath: '/(app)/home'
    }
  }

  // Determine profile type flow
  const profileType = (user.profileType || 'dancer') as ProfileType
  const flow = getOnboardingFlow(profileType, version)

  // Find the first incomplete step
  for (let i = 0; i < flow.length; i++) {
    const step = flow[i]
    const isStepComplete = checkStepCompletion(user, step)

    if (!isStepComplete) {
      const missingFields = getMissingFields(user, step)

      return {
        isComplete: false,
        currentStep: step.step,
        currentStepIndex: i,
        totalSteps: flow.length,
        progress: Math.round((i / flow.length) * 100),
        nextRequiredFields: step.required,
        version,
        missingFields,
        stepDescription: step.description,
        redirectPath: getStepRoute(step.step)
      }
    }
  }

  // All steps are complete but not marked as completed
  return {
    isComplete: true,
    currentStep: null,
    currentStepIndex: flow.length,
    totalSteps: flow.length,
    progress: 100,
    nextRequiredFields: [],
    version,
    missingFields: [],
    redirectPath: '/(app)/home'
  }
}

function checkStepCompletion(
  user: Doc<'users'>,
  step: OnboardingStep
): boolean {
  const missingFields = getMissingFields(user, step)
  return missingFields.length === 0
}

function getMissingFields(user: Doc<'users'>, step: OnboardingStep): string[] {
  const missing: string[] = []

  for (const field of step.required) {
    if (!hasRequiredField(user, field, step.minItems)) {
      missing.push(field)
    }
  }

  return missing
}

function hasRequiredField(
  user: Doc<'users'>,
  field: string,
  minItems?: number
): boolean {
  const value = getFieldValue(user, field)

  if (value === undefined || value === null) {
    return false
  }

  // Check if it's an array and meets minimum items requirement
  if (Array.isArray(value)) {
    return minItems ? value.length >= minItems : value.length > 0
  }

  // Check if it's an object and not empty
  // Note: we need to check for null again since typeof null === 'object'
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length > 0
  }

  // Check if it's a string and not empty
  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  // For other types (boolean, number), just check if they exist
  return true
}

function getFieldValue(user: Doc<'users'>, field: string): any {
  switch (field) {
    case 'profileType':
      return user.profileType
    case 'headshots':
      return user.headshots
    case 'gender':
      return user.gender
    case 'location':
      return user.location
    case 'sizing':
      return user.sizing
    case 'representation':
      return user.representation
    case 'experiences':
      return user.resume?.experiences
    case 'unionStatus':
      return user.unionStatus
    case 'companyName':
      return user.companyName
    default:
      // Handle nested fields like 'resume.experiences'
      if (field.includes('.')) {
        const parts = field.split('.')
        let value = user as any
        for (const part of parts) {
          if (value === null || value === undefined) {
            return undefined
          }
          value = value[part]
        }
        return value
      }
      return (user as any)[field]
  }
}

export function isOnboardingComplete(
  user: Doc<'users'>,
  version: string = CURRENT_ONBOARDING_VERSION
): boolean {
  const status = analyzeOnboardingProgress(user, version)
  return status.isComplete
}

export function getNextOnboardingStep(
  user: Doc<'users'>,
  version: string = CURRENT_ONBOARDING_VERSION
): string | null {
  const status = analyzeOnboardingProgress(user, version)
  return status.currentStep
}

export function getOnboardingProgress(
  user: Doc<'users'>,
  version: string = CURRENT_ONBOARDING_VERSION
): number {
  const status = analyzeOnboardingProgress(user, version)
  return status.progress
}
