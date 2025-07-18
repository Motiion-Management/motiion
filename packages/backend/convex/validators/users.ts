import { zid, zodToConvex, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { zFileUploadObjectArray, zLocation } from './base'
import { attributesPlainObject } from './attributes'
import { sizingPlainObject } from './sizing'
import { Doc } from '../_generated/dataModel'

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

export const users = {
  // meta
  tokenId: z.string(),
  type: z.literal('member'),
  isAdmin: z.boolean(),
  searchPattern: z.string().optional(),
  pointsEarned: z.number(),
  profileType: z.enum(['dancer', 'choreographer', 'guest']).optional(),
  favoriteUsers: z.array(zid('users')).optional(),

  // New onboarding tracking
  onboardingCompleted: z.boolean().optional(),
  onboardingCompletedAt: z.string().optional(), // ISO date string
  onboardingVersion: z.string().optional(),
  
  // Navigation position tracking (separate from data completion)
  currentOnboardingStep: z.string().optional(),
  currentOnboardingStepIndex: z.number().optional(),
  
  // Legacy compatibility field (remove when web app is updated)
  onboardingStep: z.string().optional(),

  // user info
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  location: zLocation.optional(),

  // talent profile
  profileTipDismissed: z.boolean().optional(),
  headshots: zFileUploadObjectArray.optional(),
  representation: zRepresentation.optional(),
  attributes: z.object(attributesPlainObject).optional(),
  sizing: z.object(sizingPlainObject).optional(),
  resume: zResume.optional(),
  links: zLinks.optional(),

  // onboarding-specific fields
  unionStatus: z.enum(['union', 'non-union', 'pending']).optional(),
  companyName: z.string().optional(),
  workLocation: z.array(z.string()).optional(), // Work location preferences
  training: z.array(zid('experiences')).optional(), // Training experiences
  databaseUse: z.string().optional() // How user intends to use the database
}
export const zUsers = z.object(users)

export const Users = Table('users', zodToConvexFields(users))
export type UserDoc = Doc<'users'>

// Legacy compatibility export for web app (temporary)
export const ONBOARDING_STEPS = {
  PROFILE_TYPE: 'profile-type',
  HEADSHOTS: 'headshots',
  HEIGHT: 'height',
  ETHNICITY: 'ethnicity',
  HAIR_COLOR: 'hair-color',
  EYE_COLOR: 'eye-color',
  GENDER: 'gender',
  LOCATION: 'location',
  UNION: 'union',
  EXPERIENCES: 'experiences',
  SKILLS: 'skills',
  TRAINING: 'training',
  REPRESENTATION: 'representation',
  SIZING: 'sizing',
  COMPANY: 'company',
  WORK_LOCATION: 'work-location',
  DATABASE_USE: 'database-use',
  RESUME: 'resume',
  COMPLETE: 'complete'
} as const

export const zClerkCreateUserFields = zUsers.pick({
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  tokenId: true
})

export const clerkCreateUserFields = zodToConvex(zClerkCreateUserFields)
