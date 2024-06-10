import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { zLocation, zVisibility } from './base'
import { attributesPlainObject } from './attributes'
import { sizingPlainObject } from './sizing'

const GENDERS = ['Male', 'Female', 'Non-Binary'] as const
const gender = z.enum(GENDERS)

export const zFileUploadObject = z.object({
  storageId: zid('_storage'),
  title: z.string().optional(),
  uploadDate: z.string()
})

export const zFileUploadObjectArray = z.array(zFileUploadObject)

export const zExperienceReferences = z.array(zid('experiences'))
export const zTrainingReferences = z.array(zid('training'))

export const zSkillsPlainObject = {
  expert: z.array(z.string()),
  proficient: z.array(z.string()),
  novice: z.array(z.string())
}
export const zSkills = z.object(zSkillsPlainObject).partial()

const representation = {
  agencyId: zid('agencies'),
  displayRep: z.boolean(),
  tipDismissed: z.boolean().optional()
}
const zRepresentation = z.object(representation)

export const resume = {
  uploads: zFileUploadObjectArray.optional(),
  televisionAndFilm: zExperienceReferences.optional(),
  musicVideos: zExperienceReferences.optional(),
  livePerformances: zExperienceReferences.optional(),
  commercials: zExperienceReferences.optional(),
  training: zTrainingReferences.optional(),
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
  lastName: z.string(),
  displayName: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: gender.optional(),
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
