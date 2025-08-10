import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

export const experiencesCommercials = {
  userId: zid('users'),
  private: z.boolean().optional(),
  companyName: z.string(),
  campaignTitle: z.string(),
  productionCompany: z.string(),
  startDate: z.string().optional(),
  duration: z.string(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  // Optional directors (per docs: Print/Commercial includes Director)
  directors: z.array(z.string()).optional()
}

export const zExperiencesCommercials = z.object(experiencesCommercials)

export const ExperiencesCommercials = Table(
  'experiencesCommercials',
  zodToConvexFields(experiencesCommercials)
)

export type ExperienceCommercialDoc = Doc<'experiencesCommercials'>
