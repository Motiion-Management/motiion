import { zid } from 'convex-helpers/server/zodV4'
import { zodTable } from 'zodvex'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'
import { zFileUploadObjectArray, zLocation } from './base'
import { attributesPlainObject } from './attributes'
import { sizingPlainObject } from './sizing'
import { zRepresentation, zResume, zLinks } from './users'

// Dancer-specific schema
export const dancers = {
  // Link to user account
  userId: zid('users'),

  // Profile management
  isPrimary: z.boolean().default(true), // First profile created during onboarding
  createdAt: z.string(), // ISO date string

  // Profile data (migrated from users table)
  headshots: zFileUploadObjectArray.optional(),
  representation: zRepresentation.optional(),
  representationStatus: z
    .enum(['represented', 'seeking', 'independent'])
    .optional(),
  attributes: z.object(attributesPlainObject).optional(),
  sizing: z.object(sizingPlainObject).optional(),
  resume: zResume.optional(),
  links: zLinks.optional(),

  // Dancer-specific fields
  sagAftraId: z.string().optional(),
  training: z.array(zid('training')).optional(),
  workLocation: z.array(z.string()).optional(), // Work location preferences

  // Search and discovery
  searchPattern: z.string().optional(), // For text search
  location: zLocation.optional(), // For proximity search

  // Profile completeness
  profileCompleteness: z.number().default(0), // 0-100 percentage
  profileTipDismissed: z.boolean().optional(),

  // Import tracking
  resumeImportedFields: z.array(z.string()).optional(),
  resumeImportVersion: z.string().optional(),
  resumeImportedAt: z.string().optional(),

  // Future dancer-specific features (placeholders)
  availability: z.any().optional(), // Calendar/availability system
  danceStyles: z.array(z.string()).optional(),
  performanceVideos: zFileUploadObjectArray.optional(),
  spotlightOrder: z.number().optional() // For featured dancers
}

export const zDancers = z.object(dancers)

// Table definition with indexes
export const Dancers = zodTable('dancers', zDancers)
export type DancerDoc = Doc<'dancers'>

// Helper type for creating a new dancer profile
export const zCreateDancerInput = zDancers.omit({
  userId: true,
  isPrimary: true,
  createdAt: true,
  profileCompleteness: true,
  searchPattern: true
})

export type CreateDancerInput = z.infer<typeof zCreateDancerInput>