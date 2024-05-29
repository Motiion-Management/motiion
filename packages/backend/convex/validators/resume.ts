import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const HAIRCOLOR = [
  'black',
  'brown',
  'blonde',
  'Dyed - See current headshot'
] as const
export const zHairColor = z.enum(HAIRCOLOR).optional()

export const EYECOLOR = [
  'Amber',
  'Blue',
  'Brown',
  'Green',
  'Gray',
  'Hazel',
  'Mixed'
] as const
export const zEyeColor = z.enum(EYECOLOR).optional()

export const ETHNICITY = [
  'American Indian / Alaska Native',
  'Asian',
  'Black / African American',
  'Hispanic / Latino',
  'Native Hawaiian / Pacific Islander',
  'White / Caucasian'
] as const
export const zEthnicity = z.enum(ETHNICITY).array().optional()

export const zHeight = z.object({
  feet: z.number(),
  inches: z.number()
})
export const attributesPlainObject = {
  ethnicity: zEthnicity,
  hairColor: zHairColor,
  eyeColor: zEyeColor,
  height: zHeight.optional()
}

const zSizing = z.object({
  chest: z.number().optional(),
  waist: z.number().optional(),
  neck: z.number().optional(),
  shoes: z.number().optional(),
  jacket: z.string().optional()
})

export const zLinks = z.object({
  reel: z.string().optional(),
  socials: z.array(z.object({ platform: z.string(), link: z.string() })),
  portfolio: z.array(z.object({ title: z.string(), link: z.string() }))
})

export const zFileUploadObject = z.object({
  storageId: zid('_storage'),
  title: z.string().optional(),
  uploadDate: z.string()
})

export const zFileUploadObjectArray = z.array(zFileUploadObject)

export const zExperienceReferences = z.array(zid('experiences'))
export const zTrainingReferences = z.array(zid('training'))
export const zSkillReferences = z.array(zid('skills'))

export const resume = {
  ...attributesPlainObject,
  userId: zid('users'),
  televisionAndFilm: zExperienceReferences.optional(),
  musicVideos: zExperienceReferences.optional(),
  livePerformances: zExperienceReferences.optional(),
  commercials: zExperienceReferences.optional(),
  training: zTrainingReferences.optional(),
  skills: zSkillReferences.optional(),
  sizing: zSizing.optional(),
  representation: zid('agencies').optional(),
  yearsOfExperience: z.number().optional(),
  headshots: zFileUploadObjectArray.optional(),
  resumeUploads: zFileUploadObjectArray.optional(),
  links: zLinks.optional()
}
export const zResume = z.object(resume)

export const Resumes = Table('resume', zodToConvexFields(resume))
