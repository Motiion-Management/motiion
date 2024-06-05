import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { attributesPlainObject } from './attributes'
import { sizingPlainObject } from './sizing'

export const zLinks = z.object({
  reel: z.string().optional(),
  socials: z
    .array(z.object({ platform: z.string(), link: z.string() }))
    .optional(),
  portfolio: z
    .array(z.object({ title: z.string(), link: z.string() }))
    .optional()
})

export const zFileUploadObject = z.object({
  storageId: zid('_storage'),
  title: z.string().optional(),
  uploadDate: z.string()
})

export const zFileUploadObjectArray = z.array(zFileUploadObject)

export const zExperienceReferences = z.array(zid('experiences'))
export const zTrainingReferences = z.array(zid('training'))

export const zSkills = z
  .object({
    expert: z.array(z.string()),
    proficient: z.array(z.string()),
    novice: z.array(z.string())
  })
  .partial()

export const resume = {
  ...attributesPlainObject,
  userId: zid('users'),
  televisionAndFilm: zExperienceReferences.optional(),
  musicVideos: zExperienceReferences.optional(),
  livePerformances: zExperienceReferences.optional(),
  commercials: zExperienceReferences.optional(),
  training: zTrainingReferences.optional(),
  skills: zSkills.optional(),
  sizing: z.object(sizingPlainObject).optional(),
  displayRepresentation: z.boolean().optional(),
  representation: zid('agencies').optional(),
  yearsOfExperience: z.number().optional(),
  headshots: zFileUploadObjectArray.optional(),
  resumeUploads: zFileUploadObjectArray.optional(),
  links: zLinks.optional()
}
export const zResume = z.object(resume)

export const Resumes = Table('resume', zodToConvexFields(resume))
