import { zid } from 'zodvex'
import { zodTable, zodToConvex } from 'zodvex'
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

export const representationObj = {
  agencyId: zid('agencies').optional(),
  displayRep: z.boolean().optional(),
  tipDismissed: z.boolean().optional()
}
export const zRepresentation = z.object(representationObj)

export const resume = {
  projects: z.array(zid('projects')).optional(),
  uploads: zFileUploadObjectArray.optional(),
  skills: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional()
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
  type: z.literal('member'), // for future use
  isAdmin: z.boolean(),

  pushTokens: z
    .array(
      z.object({
        token: z.string(),
        platform: z.enum(['ios', 'android']),
        updatedAt: z.number()
      })
    )
    .optional(),

  // DEPRECATED: Will be removed after migration to dancers/choreographers
  profileType: z.enum(['dancer', 'choreographer', 'guest']).optional(),

  // DEPRECATED: Moved to profiles
  searchPattern: z.string().optional(),

  // DEPRECATED: Not in designs, will be removed
  pointsEarned: z.number().optional(),

  // DEPRECATED: Converted to favoriteDancers/favoriteChoreographers on profiles
  favoriteUsers: z.array(zid('users')).optional(),

  // DEPRECATED: Moved to profiles (onboarding is per-profile)
  onboardingCompleted: z.boolean().optional(),
  onboardingCompletedAt: z.string().optional(),
  onboardingVersion: z.string().optional(),
  currentOnboardingStep: z.string().optional(),
  currentOnboardingStepIndex: z.number().optional(),

  // DEPRECATED: Legacy compatibility field, remove after migration
  onboardingStep: z.string().optional(),

  // user info
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),

  // DEPRECATED: Moved to dancer/choreographer profiles
  displayName: z.string().optional(),

  fullName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),

  // DEPRECATED: Moved to profiles
  location: zLocation.optional(),

  // DEPRECATED: These fields are being migrated to dancers/choreographers tables
  // They remain optional for backward compatibility during migration
  // TODO: Remove these fields after migration is complete and verified
  profileTipDismissed: z.boolean().optional(),
  headshots: zFileUploadObjectArray.optional(),
  representation: zRepresentation.optional(),
  attributes: z.object(attributesPlainObject).optional(),
  sizing: z.object(sizingPlainObject).optional(),
  resume: zResume.optional(),
  links: zLinks.optional(),
  sagAftraId: z.string().optional(),
  companyName: z.string().optional(),
  workLocation: z.array(z.string()).optional(),
  training: z.array(zid('training')).optional(),
  databaseUse: z.string().optional(),
  representationStatus: z
    .enum(['represented', 'seeking', 'independent'])
    .optional(),
  // searchPattern field kept once for backward compatibility during migration

  // Resume import tracking
  resumeImportedFields: z.array(z.string()).optional(), // Fields that were populated from resume import
  resumeImportVersion: z.string().optional(), // Version of import logic used
  resumeImportedAt: z.string().optional(), // ISO date string when resume was imported

  // Profile references (Phase 2 - multi-profile support)
  activeProfileType: z.enum(['dancer', 'choreographer']).optional(),
  activeDancerId: zid('dancers').optional(),
  activeChoreographerId: zid('choreographers').optional()
}
export const zUsers = z.object(users)

// Combined table definition with integrated codec
export const Users = zodTable('users', users)
export type UserDoc = Doc<'users'>
// Alternative type derived from Zod schema with proper type information
export type ZodUserDoc = typeof Users.doc

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
