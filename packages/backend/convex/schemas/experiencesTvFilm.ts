import { z } from 'zod'
import { clientZid as zid } from './clientZid'

export const experiencesTvFilm = {
  userId: zid('users'),
  private: z.boolean().optional(),
  title: z.string(),
  studio: z.string(),
  startDate: z.string(), // ISO date
  duration: z.string(), // e.g., "1 week", "3 months"
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
}

export const zExperiencesTvFilm = z.object(experiencesTvFilm)

