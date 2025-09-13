import { zid } from 'convex-helpers/server/zodV4'
import { zodToConvexFields } from '@packages/zodvex'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

// Unified project schema using a generic type/subtype approach.
// Types align with frontend values: 'tv-film', 'music-video', 'live-performance', 'commercial'.
export const PROJECT_TYPES = [
  'tv-film',
  'music-video',
  'live-performance',
  'commercial'
] as const

export const PROJECT_TITLE_MAP: Record<(typeof PROJECT_TYPES)[number], string> =
  {
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

export const projects = {
  // Core
  userId: zid('users'),
  private: z.boolean().optional(),
  type: z.enum(PROJECT_TYPES),
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

export const zProjects = z.object(projects)

// Full Convex document schema (includes system fields)
export const zProjectsDoc = zProjects.extend({
  _id: zid('projects').optional(),
  _creationTime: z.number().optional()
})

// Aliases for clarity in imports
export const zProjectsBase = zProjects

export const Projects = Table('projects', zodToConvexFields(projects))

export type ProjectDoc = Doc<'projects'>

// Frontend form-friendly type (optional system fields)
export type ProjectFormDoc = z.infer<typeof zProjectsDoc>
