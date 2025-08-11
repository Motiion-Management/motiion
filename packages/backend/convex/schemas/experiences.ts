import { z } from 'zod'
import { clientZid as zid } from './clientZid'
// Local enum of live performance subtypes to avoid per-type schema imports
export const LIVE_EVENT_TYPES = [
  'festival',
  'tour',
  'concert',
  'corporate',
  'award-show',
  'theater',
  'other'
] as const

// Discriminated union for client-side forms keyed by 'type'.

const tvFilm = z.object({
  type: z.literal('tv-film'),
  userId: zid('users'),
  private: z.boolean().optional(),
  // Details
  title: z.string(),
  studio: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.string(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  // Team
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional()
})

const musicVideo = z.object({
  type: z.literal('music-video'),
  userId: zid('users'),
  private: z.boolean().optional(),
  // Details
  songTitle: z.string(),
  artists: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.string(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  // Team
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional()
})

const livePerformance = z.object({
  type: z.literal('live-performance'),
  userId: zid('users'),
  private: z.boolean().optional(),
  // Subtype discriminator for live performances
  subtype: z.enum(LIVE_EVENT_TYPES),
  // Common
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.string(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  // Subtype-specific
  festivalTitle: z.string().optional(),
  tourName: z.string().optional(),
  tourArtist: z.string().optional(),
  companyName: z.string().optional(),
  eventName: z.string().optional(),
  awardShowName: z.string().optional(),
  productionTitle: z.string().optional(),
  venue: z.string().optional(),
  // Team
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional()
})

const commercial = z.object({
  type: z.literal('commercial'),
  userId: zid('users'),
  private: z.boolean().optional(),
  // Details
  companyName: z.string(),
  campaignTitle: z.string(),
  productionCompany: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.string(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  // Team
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional()
})

export const zExperiencesUnified = z.discriminatedUnion('type', [
  tvFilm,
  musicVideo,
  livePerformance,
  commercial
])
