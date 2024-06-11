import { zid, zodToConvex, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { zFileUploadObjectArray, zGender, zLocation } from './base'
import { attributesPlainObject } from './attributes'
import { sizingPlainObject } from './sizing'
import { Doc } from '../_generated/dataModel'

export const ONBOARDING_STEPS = {
  COMPLETE: 0,
  VISION: 1,
  PERSONAL_INFO: 2,
  HEADSHOTS: 3,
  RESUME: 4
} as const

export const zSkillsPlainObject = {
  expert: z.array(z.string()),
  proficient: z.array(z.string()),
  novice: z.array(z.string())
}
export const zSkills = z.object(zSkillsPlainObject).partial()

export const representationObj = {
  agencyId: zid('agencies'),
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
    .array(z.object({ platform: z.string(), link: z.string() }))
    .optional(),
  portfolio: z
    .array(z.object({ title: z.string(), link: z.string() }))
    .optional()
}

export const zLinks = z.object(links)

export const users = {
  // meta
  tokenId: z.string(),
  type: z.literal('member'),
  isAdmin: z.boolean(),
  searchPattern: z.string().optional(),
  pointsEarned: z.number(),
  onboardingStep: z.number(),

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
