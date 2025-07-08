export type ProfileType = 'dancer' | 'choreographer' | 'guest'

export interface OnboardingStep {
  step: string
  required: string[]
  minItems?: number
  description?: string
}

export interface OnboardingFlow {
  [key: string]: OnboardingStep[]
}

export interface OnboardingFlows {
  [version: string]: {
    dancer: OnboardingStep[]
    choreographer: OnboardingStep[]
    guest: OnboardingStep[]
  }
}

export const CURRENT_ONBOARDING_VERSION = 'v2'

export const ONBOARDING_FLOWS: OnboardingFlows = {
  v2: {
    dancer: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'headshots',
        required: ['headshots'],
        minItems: 1,
        description: 'Upload professional headshots'
      },
      {
        step: 'physical',
        required: ['gender', 'location'],
        description: 'Physical characteristics and location'
      },
      {
        step: 'sizing',
        required: ['sizing'],
        description: 'Clothing and measurement details'
      },
      {
        step: 'representation',
        required: ['representation'],
        description: 'Agency and representation information'
      },
      {
        step: 'resume',
        required: ['experiences'],
        minItems: 1,
        description: 'Professional experience and training'
      },
      {
        step: 'union',
        required: ['unionStatus'],
        description: 'Union membership status'
      }
    ],
    choreographer: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'headshots',
        required: ['headshots'],
        minItems: 1,
        description: 'Upload professional headshots'
      },
      {
        step: 'location',
        required: ['location'],
        description: 'Your location and work areas'
      },
      {
        step: 'representation',
        required: ['representation'],
        description: 'Agency and representation information'
      },
      {
        step: 'resume',
        required: ['experiences'],
        minItems: 1,
        description: 'Professional experience and credits'
      }
    ],
    guest: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'company',
        required: ['companyName'],
        description: 'Company or organization information'
      }
    ]
  }
}

export const STEP_ROUTES = {
  'profile-type': '/(app)/onboarding/profile-type',
  headshots: '/(app)/onboarding/headshots',
  physical: '/(app)/onboarding/physical',
  sizing: '/(app)/onboarding/sizing',
  location: '/(app)/onboarding/location',
  representation: '/(app)/onboarding/representation',
  resume: '/(app)/onboarding/resume',
  union: '/(app)/onboarding/union',
  company: '/(app)/onboarding/company'
} as const

export function getOnboardingFlow(
  profileType: ProfileType,
  version: string = CURRENT_ONBOARDING_VERSION
): OnboardingStep[] {
  const flows = ONBOARDING_FLOWS[version]
  if (!flows) {
    // Default to v2 if version not found
    console.warn(`Onboarding version ${version} not found, using v2`)
    return ONBOARDING_FLOWS.v2[profileType] || ONBOARDING_FLOWS.v2.dancer
  }

  const flow = flows[profileType]
  if (!flow) {
    // Default to dancer flow if profile type not found
    console.warn(
      `Onboarding flow for ${profileType} not found in version ${version}, using dancer flow`
    )
    return flows.dancer || []
  }

  return flow
}

export function getStepRoute(step: string): string {
  return (
    STEP_ROUTES[step as keyof typeof STEP_ROUTES] ||
    '/(app)/onboarding/profile-type'
  )
}

export function getTotalSteps(
  profileType: ProfileType,
  version: string = CURRENT_ONBOARDING_VERSION
): number {
  return getOnboardingFlow(profileType, version).length
}
