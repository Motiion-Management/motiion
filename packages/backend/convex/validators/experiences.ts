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

export const EXPERIENCE_TITLE_MAP: Record<
  (typeof EXPERIENCE_TYPES)[number],
  string
> = {
  'tv-film': 'Television & Film',
  'music-video': 'Music Videos',
  'live-performance': 'Live Performances',
  commercial: 'Commercials'
}

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
  endDate: z.string().optional(),
  duration: z.string().optional(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()).optional(),

  // Unified title field for all types
  title: z.string().optional(),
  // TV/Film
  studio: z.string().optional(),
  // Music Videos
  artists: z.array(z.string()).optional(),
  // Commercials
  companyName: z.string().optional(),
  productionCompany: z.string().optional(),
  // Live Performances
  tourArtist: z.string().optional(),
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

// Full Convex document schema (includes system fields)
export const zExperiencesDoc = zExperiences.extend({
  _id: zid('experiences'),
  _creationTime: z.number()
})

// Aliases for clarity in imports
export const zExperiencesBase = zExperiences

export const Experiences = Table('experiences', zodToConvexFields(experiences))

export type ExperienceDoc = Doc<'experiences'>
