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
  dancer: OnboardingStep[]
  choreographer: OnboardingStep[]
  guest: OnboardingStep[]
}

export const CURRENT_ONBOARDING_VERSION = 'v2'

// Group definitions for organizing steps
export const ONBOARDING_GROUPS = {
  profile: {
    key: 'profile' as const,
    label: 'Profile',
    steps: [
      'profile-type',
      'resume',
      'headshots',
      'display-name',
      'database-use',
      'company'
    ] as readonly string[],
    basePath: '/app/onboarding/profile'
  },
  attributes: {
    key: 'attributes' as const,
    label: 'Attributes',
    steps: [
      'height',
      'ethnicity',
      'hair-color',
      'eye-color',
      'gender'
    ] as readonly string[],
    basePath: '/app/onboarding/attributes'
  },
  'work-details': {
    key: 'work-details' as const,
    label: 'Work Details',
    steps: [
      'sizing',
      'location',
      'work-location',
      'representation',
      'agency',
      'union'
    ] as readonly string[],
    basePath: '/app/onboarding/work-details'
  },
  experiences: {
    key: 'experiences' as const,
    label: 'Experience',
    steps: ['projects', 'training', 'skills'] as readonly string[],
    basePath: '/app/onboarding/experiences'
  },
  review: {
    key: 'review' as const,
    label: 'Review',
    steps: ['review', 'projects-review'] as readonly string[],
    basePath: '/app/onboarding/review'
  }
} as const

// Export types derived from the constants
export type OnboardingGroupKey = keyof typeof ONBOARDING_GROUPS
export type OnboardingGroupConfig =
  (typeof ONBOARDING_GROUPS)[OnboardingGroupKey]

// Define which groups are shown for each profile type
export const ONBOARDING_GROUP_FLOWS = {
  dancer: [
    'profile',
    'attributes',
    'work-details',
    'experiences',
    'review'
  ] as readonly OnboardingGroupKey[],
  choreographer: [
    'profile',
    'attributes',
    'work-details',
    'experiences',
    'review'
  ] as readonly OnboardingGroupKey[],
  guest: ['profile', 'review'] as readonly OnboardingGroupKey[]
} as const

export const ONBOARDING_FLOWS: OnboardingFlows = {
  dancer: [
    // Profile group
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
      step: 'headshots',
      required: ['headshots'],
      minItems: 1,
      description: 'Upload professional headshots'
    },
    {
      step: 'display-name',
      required: ['displayName'],
      description: 'Set your preferred display name'
    },
    // Attributes group
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
    // Work Details group
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
      step: 'union',
      required: [],
      description: 'SAG-AFTRA membership (optional)'
    },
    // Experience group
    {
      step: 'projects',
      required: ['projects'],
      minItems: 1,
      description: 'Professional projects'
    },
    {
      step: 'training',
      required: ['training'],
      description: 'Training and education'
    },
    {
      step: 'skills',
      required: ['skills'],
      description: 'Skills and abilities'
    },
    // Review group
    {
      step: 'review',
      required: [],
      description: 'Review profile information'
    }
  ],
  choreographer: [
    // Profile group
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
      step: 'headshots',
      required: ['headshots'],
      minItems: 1,
      description: 'Upload professional headshots'
    },
    {
      step: 'display-name',
      required: ['displayName'],
      description: 'Set your preferred display name'
    },
    // Work Details group
    {
      step: 'sizing',
      required: [],
      description: 'Clothing and measurement details (optional)'
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
      step: 'union',
      required: [],
      description: 'SAG-AFTRA membership (optional)'
    },
    // Experience group
    {
      step: 'projects',
      required: ['projects'],
      minItems: 1,
      description: 'Professional projects'
    },
    {
      step: 'training',
      required: ['training'],
      description: 'Training and education'
    },
    {
      step: 'skills',
      required: ['skills'],
      description: 'Skills and abilities'
    },
    // Review group
    {
      step: 'review',
      required: [],
      description: 'Review profile information'
    }
  ],
  guest: [
    // Profile group
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
    // Review group
    {
      step: 'review',
      required: [],
      description: 'Review profile information'
    }
  ]
}

export const STEP_ROUTES = {
  'profile-type': '/app/onboarding/profile/profile-type',
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
  resume: '/app/onboarding/profile/resume',
  projects: '/app/onboarding/experiences/projects',
  training: '/app/onboarding/work-details/training',
  skills: '/app/onboarding/work-details/skills',
  union: '/app/onboarding/work-details/union',
  'database-use': '/app/onboarding/guest/database-use',
  company: '/app/onboarding/guest/company',
  review: '/app/onboarding/review'
} as const

export type STEP = keyof typeof STEP_ROUTES

export function getOnboardingFlow(profileType: ProfileType): OnboardingStep[] {
  const flow = ONBOARDING_FLOWS[profileType]
  if (!flow) {
    // Default to dancer flow if profile type not found
    console.warn(
      `Onboarding flow for ${profileType} not found, using dancer flow`
    )
    return ONBOARDING_FLOWS.dancer || []
  }

  return flow
}

export function getStepRoute(step: string): string {
  return (
    STEP_ROUTES[step as keyof typeof STEP_ROUTES] ||
    '/app/onboarding/profile-type'
  )
}

export function getTotalSteps(profileType: ProfileType): number {
  return getOnboardingFlow(profileType).length
}

// Step validator type
export type StepValidator = (user: any) => boolean

// Validation matrix for each step
export const STEP_VALIDATORS: Record<string, StepValidator> = {
  'profile-type': (user) => !!user.profileType,

  'display-name': (user) => !!user.displayName,

  height: (user) =>
    !!(user.attributes?.height?.feet && user.attributes?.height?.inches),

  ethnicity: (user) =>
    !!(user.attributes?.ethnicity && user.attributes.ethnicity.length > 0),

  'hair-color': (user) => !!user.attributes?.hairColor,

  'eye-color': (user) => !!user.attributes?.eyeColor,

  gender: (user) => !!user.attributes?.gender,

  headshots: (user) => !!(user.headshots && user.headshots.length > 0),

  sizing: (user) => {
    const sizing = user.sizing
    if (!sizing) return false
    // Check if at least some sizing data exists
    return !!(sizing.general || sizing.male || sizing.female)
  },

  location: (user) => !!user.location,

  'work-location': (user) =>
    !!(user.workLocation && user.workLocation.length > 0),

  representation: (user) => !!user.representationStatus,

  agency: (user) => {
    // Only required if representationStatus is 'represented'
    if (user.representationStatus !== 'represented') return true
    return !!user.representation?.agencyId
  },

  training: (user) => !!(user.training && user.training.length > 0),

  projects: (user) =>
    !!(user.resume?.projects && user.resume.projects.length > 0),

  skills: (user) => !!(user.resume?.skills && user.resume.skills.length > 0),

  union: (user) => true, // Optional step, always considered complete

  'database-use': (user) => !!user.databaseUse,

  company: (user) => !!user.companyName,

  resume: (user) => true, // Optional step

  review: (user) => true // Review step has no data requirements
}

// Helper to check if a step is complete
export function isStepComplete(step: string, user: any): boolean {
  const validator = STEP_VALIDATORS[step]
  return validator ? validator(user) : false
}

// Helper to get completion status for entire flow
export function getFlowCompletionStatus(
  user: any,
  profileType: ProfileType,
  version: string = CURRENT_ONBOARDING_VERSION
): {
  completedSteps: string[]
  incompleteSteps: string[]
  nextIncompleteStep: string | null
  completionPercentage: number
} {
  const flow = getOnboardingFlow(profileType)
  const completedSteps: string[] = []
  const incompleteSteps: string[] = []

  for (const step of flow) {
    if (isStepComplete(step.step, user)) {
      completedSteps.push(step.step)
    } else {
      incompleteSteps.push(step.step)
    }
  }

  const nextIncompleteStep = incompleteSteps[0] || null
  const completionPercentage = Math.round(
    (completedSteps.length / flow.length) * 100
  )

  return {
    completedSteps,
    incompleteSteps,
    nextIncompleteStep,
    completionPercentage
  }
}
