import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

export const experiencesTvFilm = {
  userId: zid('users'),
  private: z.boolean().optional(),
  projectType: z.enum(['television', 'film']),
  title: z.string(),
  studio: z.string(),
  startDate: z.string(), // ISO date
  duration: z.string(), // e.g., "1 week", "3 months"
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional()
}

export const zExperiencesTvFilm = z.object(experiencesTvFilm)

export const ExperiencesTvFilm = Table('experiencesTvFilm', zodToConvexFields(experiencesTvFilm))

export type ExperienceTvFilmDoc = Doc<'experiencesTvFilm'>