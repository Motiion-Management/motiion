import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

// Unified experience schema using a generic type/subtype approach.
// Types align with frontend values: 'tv-film', 'music-video', 'live-performance', 'commercial'.
export const EXPERIENCE_TYPES = [
  'tv-film',
  'music-video',
  'live-performance',
  'commercial'
] as const

export const LIVE_EVENT_SUBTYPES = [
  'festival',
  'tour',
  'concert',
  'corporate',
  'award-show',
  'theater',
  'other'
] as const

export const experiences = {
  // Core
  userId: zid('users'),
  private: z.boolean().optional(),
  type: z.enum(EXPERIENCE_TYPES),
  // Generic subtype (used for live-performance; optional otherwise)
  subtype: z.enum(LIVE_EVENT_SUBTYPES).optional(),

  // Common fields
  startDate: z.string().optional(),
  duration: z.string().optional(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),

  // TV/Film
  title: z.string().optional(),
  studio: z.string().optional(),

  // Music Videos
  songTitle: z.string().optional(),
  artists: z.array(z.string()).optional(),

  // Commercials
  companyName: z.string().optional(),
  campaignTitle: z.string().optional(),
  productionCompany: z.string().optional(),

  // Live Performances (type-specific optional fields)
  festivalTitle: z.string().optional(),
  tourName: z.string().optional(),
  tourArtist: z.string().optional(),
  eventName: z.string().optional(),
  awardShowName: z.string().optional(),
  productionTitle: z.string().optional(),
  venue: z.string().optional(),

  // Team fields
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional(),

  // Search helpers (optional; can be populated by server later)
  searchPattern: z.string().optional()
}

export const zExperiences = z.object(experiences)

export const Experiences = Table('experiences', zodToConvexFields(experiences))

export type ExperienceDoc = Doc<'experiences'>
