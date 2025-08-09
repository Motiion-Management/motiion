import { z } from 'zod'
import { clientZid as zid } from './clientZid'

export const EVENT_TYPES = [
  'festival',
  'tour',
  'concert',
  'corporate',
  'award-show',
  'theater',
  'other',
] as const

export const experiencesLivePerformances = {
  userId: zid('users'),
  private: z.boolean().optional(),
  eventType: z.enum(EVENT_TYPES),
  // Common fields
  startDate: z.string(),
  duration: z.string(), // Can be "Current" for ongoing
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),

  // Type-specific fields (all optional, used based on eventType)
  festivalTitle: z.string().optional(), // For festivals
  tourName: z.string().optional(), // For tours
  tourArtist: z.string().optional(), // For tours
  companyName: z.string().optional(), // For corporate
  eventName: z.string().optional(), // For corporate/other
  awardShowName: z.string().optional(), // For award shows
  productionTitle: z.string().optional(), // For theater
  venue: z.string().optional(), // For concerts/theater

  // Team fields
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
}

export const zExperiencesLivePerformances = z.object(experiencesLivePerformances)

