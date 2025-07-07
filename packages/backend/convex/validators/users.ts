import { zid, zodToConvex, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { zFileUploadObjectArray, zGender, zLocation } from './base'
import { attributesPlainObject } from './attributes'
import { sizingPlainObject } from './sizing'
import { Doc } from '../_generated/dataModel'

export const ONBOARDING_STEPS = {
  COMPLETE: 0,
  PROFILE_TYPE: 1,
  // Dancer path
  DANCER_HEADSHOTS: 2,
  DANCER_PHYSICAL: 3, // height, ethnicity, hair, eyes, gender
  DANCER_SIZING: 4,
  DANCER_LOCATION: 5,
  DANCER_REPRESENTATION: 6,
  DANCER_RESUME: 7,
  DANCER_UNION: 8,
  // Choreographer path  
  CHOREOGRAPHER_HEADSHOTS: 10,
  CHOREOGRAPHER_LOCATION: 11,
  CHOREOGRAPHER_REPRESENTATION: 12,
  CHOREOGRAPHER_RESUME: 13,
  // Guest path
  GUEST_DATABASE: 20,
  GUEST_COMPANY: 21
} as const

export const zSkillsPlainObject = {
  expert: z.array(z.string()),
  proficient: z.array(z.string()),
  novice: z.array(z.string())
}
export const zSkills = z.object(zSkillsPlainObject).partial()

export const representationObj = {
  agencyId: zid('agencies').optional(),
  displayRep: z.boolean().optional(),
  tipDismissed: z.boolean().optional()
}
export const zRepresentation = z.object(representationObj)

export const resume = {
  experiences: z.array(zid('experiences')).optional(),
  uploads: zFileUploadObjectArray.optional(),
  skills: zSkills.optional()
}

export const zResume = z.object(resume)

export const links = {
  reel: z.string().optional(),
  socials: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      tiktok: z.string().optional()
    })
    .optional(),
  other: z.array(z.object({ label: z.string(), url: z.string() })).optional()
}

export const zLinks = z.object(links)

// Profile type definitions
export type ProfileType = 'dancer' | 'choreographer' | 'guest'

// Helper function to get next step based on profile type
export function getNextOnboardingStep(currentStep: number, profileType?: ProfileType): number {
  if (!profileType) {
    return ONBOARDING_STEPS.PROFILE_TYPE
  }

  switch (profileType) {
    case 'dancer':
      switch (currentStep) {
        case ONBOARDING_STEPS.PROFILE_TYPE:
          return ONBOARDING_STEPS.DANCER_HEADSHOTS
        case ONBOARDING_STEPS.DANCER_HEADSHOTS:
          return ONBOARDING_STEPS.DANCER_PHYSICAL
        case ONBOARDING_STEPS.DANCER_PHYSICAL:
          return ONBOARDING_STEPS.DANCER_SIZING
        case ONBOARDING_STEPS.DANCER_SIZING:
          return ONBOARDING_STEPS.DANCER_LOCATION
        case ONBOARDING_STEPS.DANCER_LOCATION:
          return ONBOARDING_STEPS.DANCER_REPRESENTATION
        case ONBOARDING_STEPS.DANCER_REPRESENTATION:
          return ONBOARDING_STEPS.DANCER_RESUME
        case ONBOARDING_STEPS.DANCER_RESUME:
          return ONBOARDING_STEPS.DANCER_UNION
        case ONBOARDING_STEPS.DANCER_UNION:
          return ONBOARDING_STEPS.COMPLETE
        default:
          return ONBOARDING_STEPS.COMPLETE
      }
    case 'choreographer':
      switch (currentStep) {
        case ONBOARDING_STEPS.PROFILE_TYPE:
          return ONBOARDING_STEPS.CHOREOGRAPHER_HEADSHOTS
        case ONBOARDING_STEPS.CHOREOGRAPHER_HEADSHOTS:
          return ONBOARDING_STEPS.CHOREOGRAPHER_LOCATION
        case ONBOARDING_STEPS.CHOREOGRAPHER_LOCATION:
          return ONBOARDING_STEPS.CHOREOGRAPHER_REPRESENTATION
        case ONBOARDING_STEPS.CHOREOGRAPHER_REPRESENTATION:
          return ONBOARDING_STEPS.CHOREOGRAPHER_RESUME
        case ONBOARDING_STEPS.CHOREOGRAPHER_RESUME:
          return ONBOARDING_STEPS.COMPLETE
        default:
          return ONBOARDING_STEPS.COMPLETE
      }
    case 'guest':
      switch (currentStep) {
        case ONBOARDING_STEPS.PROFILE_TYPE:
          return ONBOARDING_STEPS.GUEST_DATABASE
        case ONBOARDING_STEPS.GUEST_DATABASE:
          return ONBOARDING_STEPS.GUEST_COMPANY
        case ONBOARDING_STEPS.GUEST_COMPANY:
          return ONBOARDING_STEPS.COMPLETE
        default:
          return ONBOARDING_STEPS.COMPLETE
      }
    default:
      return ONBOARDING_STEPS.COMPLETE
  }
}

// Get total steps for a profile type
export function getTotalStepsForProfile(profileType?: ProfileType): number {
  switch (profileType) {
    case 'dancer':
      return 8 // profile type + 7 dancer steps
    case 'choreographer':
      return 5 // profile type + 4 choreographer steps
    case 'guest':
      return 3 // profile type + 2 guest steps
    default:
      return 1 // just profile type selection
  }
}

// Get current step index for progress tracking
export function getCurrentStepIndex(onboardingStep: number, profileType?: ProfileType): number {
  if (onboardingStep === ONBOARDING_STEPS.COMPLETE) {
    return getTotalStepsForProfile(profileType)
  }
  
  if (onboardingStep === ONBOARDING_STEPS.PROFILE_TYPE) {
    return 0
  }

  switch (profileType) {
    case 'dancer':
      switch (onboardingStep) {
        case ONBOARDING_STEPS.DANCER_HEADSHOTS: return 1
        case ONBOARDING_STEPS.DANCER_PHYSICAL: return 2
        case ONBOARDING_STEPS.DANCER_SIZING: return 3
        case ONBOARDING_STEPS.DANCER_LOCATION: return 4
        case ONBOARDING_STEPS.DANCER_REPRESENTATION: return 5
        case ONBOARDING_STEPS.DANCER_RESUME: return 6
        case ONBOARDING_STEPS.DANCER_UNION: return 7
        default: return 0
      }
    case 'choreographer':
      switch (onboardingStep) {
        case ONBOARDING_STEPS.CHOREOGRAPHER_HEADSHOTS: return 1
        case ONBOARDING_STEPS.CHOREOGRAPHER_LOCATION: return 2
        case ONBOARDING_STEPS.CHOREOGRAPHER_REPRESENTATION: return 3
        case ONBOARDING_STEPS.CHOREOGRAPHER_RESUME: return 4
        default: return 0
      }
    case 'guest':
      switch (onboardingStep) {
        case ONBOARDING_STEPS.GUEST_DATABASE: return 1
        case ONBOARDING_STEPS.GUEST_COMPANY: return 2
        default: return 0
      }
    default:
      return 0
  }
}

export const users = {
  // meta
  tokenId: z.string(),
  type: z.literal('member'),
  isAdmin: z.boolean(),
  searchPattern: z.string().optional(),
  pointsEarned: z.number(),
  onboardingStep: z.number(),
  profileType: z.enum(['dancer', 'choreographer', 'guest']).optional(),
  favoriteUsers: z.array(zid('users')).optional(),

  // user info
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: zGender.optional(),
  location: zLocation.optional(),

  // talent profile
  profileTipDismissed: z.boolean().optional(),
  headshots: zFileUploadObjectArray.optional(),
  representation: zRepresentation.optional(),
  attributes: z.object(attributesPlainObject).optional(),
  sizing: z.object(sizingPlainObject).optional(),
  resume: zResume.optional(),
  links: zLinks.optional()
}
export const zUsers = z.object(users)

export const Users = Table('users', zodToConvexFields(users))
export type UserDoc = Doc<'users'>

export const zClerkCreateUserFields = zUsers.pick({
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  tokenId: true
})

export const clerkCreateUserFields = zodToConvex(zClerkCreateUserFields)
