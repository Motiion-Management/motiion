import { zid } from 'zodvex'
import { zodTable, zodToConvex } from 'zodvex'
import { z } from 'zod'
import { zFileUploadObjectArray } from './base'
import { Doc } from '../_generated/dataModel'

// Profile type definitions
export type ProfileType = 'dancer' | 'choreographer' | 'guest'

// Shared types used by dancers/choreographers schemas
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

  // user info
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),

  // Profile references (multi-profile support)
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
