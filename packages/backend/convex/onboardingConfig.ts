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
        step: 'resume',
        required: [],
        description: 'Import or attach your resume (optional)'
      },
      {
        step: 'display-name',
        required: ['displayName'],
        description: 'Set your preferred display name'
      },
      {
        step: 'height',
        required: ['height'],
        description: 'Your height information'
      },
      {
        step: 'ethnicity',
        required: ['ethnicity'],
        description: 'Your ethnicity'
      },
      {
        step: 'hair-color',
        required: ['hairColor'],
        description: 'Your hair color'
      },
      {
        step: 'eye-color',
        required: ['eyeColor'],
        description: 'Your eye color'
      },
      {
        step: 'gender',
        required: ['gender'],
        description: 'Your gender'
      },
      {
        step: 'headshots',
        required: ['headshots'],
        minItems: 1,
        description: 'Upload professional headshots'
      },
      {
        step: 'sizing',
        required: ['sizing'],
        description: 'Clothing and measurement details'
      },
      {
        step: 'location',
        required: ['location'],
        description: 'Your location'
      },
      {
        step: 'work-location',
        required: ['workLocation'],
        description: 'Your work location preferences'
      },
      {
        step: 'representation',
        required: ['representationStatus'],
        description: 'Agency and representation information'
      },
      {
        step: 'agency',
        required: ['agency'],
        description: 'Agency selection (conditional)'
      },
      {
        step: 'training',
        required: ['training'],
        description: 'Training and education'
      },
      {
        step: 'experiences',
        required: ['experiences'],
        minItems: 1,
        description: 'Professional experience'
      },
      {
        step: 'skills',
        required: ['skills'],
        description: 'Skills and abilities'
      },
      {
        step: 'union',
        required: [],
        description: 'SAG-AFTRA membership (optional)'
      },
      {
        step: 'review',
        required: [],
        description: 'Review profile information'
      }
    ],
    choreographer: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'resume',
        required: [],
        description: 'Import or attach your resume (optional)'
      },
      {
        step: 'display-name',
        required: ['displayName'],
        description: 'Set your preferred display name'
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
        description: 'Your location'
      },
      {
        step: 'representation',
        required: ['representationStatus'],
        description: 'Agency and representation information'
      },
      {
        step: 'agency',
        required: ['agency'],
        description: 'Agency selection (conditional)'
      },
      {
        step: 'training',
        required: ['training'],
        description: 'Training and education'
      },
      {
        step: 'experiences',
        required: ['experiences'],
        minItems: 1,
        description: 'Professional experience'
      },
      {
        step: 'review',
        required: [],
        description: 'Review profile information'
      }
    ],
    guest: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'database-use',
        required: ['databaseUse'],
        description: 'How will you use the database'
      },
      {
        step: 'company',
        required: ['companyName'],
        description: 'Company or organization information'
      },
      {
        step: 'review',
        required: [],
        description: 'Review profile information'
      }
    ]
  }
}

export const STEP_ROUTES = {
  'profile-type': '/app/onboarding/profile/type',
  'display-name': '/app/onboarding/attributes/display-name',
  headshots: '/app/onboarding/work-details/headshots',
  height: '/app/onboarding/attributes/height',
  ethnicity: '/app/onboarding/attributes/ethnicity',
  'hair-color': '/app/onboarding/attributes/hair-color',
  'eye-color': '/app/onboarding/attributes/eye-color',
  gender: '/app/onboarding/attributes/gender',
  sizing: '/app/onboarding/work-details/sizing',
  location: '/app/onboarding/work-details/location',
  'work-location': '/app/onboarding/work-details/work-location',
  representation: '/app/onboarding/work-details/representation',
  agency: '/app/onboarding/work-details/agency',
  resume: '/app/onboarding/work-details/resume',
  experiences: '/app/onboarding/experiences',
  training: '/app/onboarding/work-details/training',
  skills: '/app/onboarding/work-details/skills',
  union: '/app/onboarding/work-details/union',
  'database-use': '/app/onboarding/guest/database-use',
  company: '/app/onboarding/guest/company',
  review: '/app/onboarding/review'
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
    '/app/onboarding/profile-type'
  )
}

export function getTotalSteps(
  profileType: ProfileType,
  version: string = CURRENT_ONBOARDING_VERSION
): number {
  return getOnboardingFlow(profileType, version).length
}
