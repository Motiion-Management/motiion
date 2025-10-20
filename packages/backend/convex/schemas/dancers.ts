import { zid } from 'zodvex'
import { zodTable } from 'zodvex'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'
import { zFileUploadObjectArray } from './base'
import { attributesPlainObject } from './attributes'
import { zResume, zLinks } from './users'
import { displayNameDbField, headshotsDbField, representationDbField, locationDbField, sizingDbField, workLocationDbField, sagAftraIdDbField } from './fields'

// Dancer-specific schema
export const dancers = {
  // Link to user account
  userId: zid('users'),

  // Profile management
  isPrimary: z.boolean().default(true), // First profile created during onboarding
  createdAt: z.string(), // ISO date string

  // Profile-level identity
  displayName: displayNameDbField,

  // Onboarding state (per profile)
  onboardingCompleted: z.boolean().optional(),
  onboardingCompletedAt: z.string().optional(),
  onboardingVersion: z.string().optional(),
  currentOnboardingStep: z.string().optional(),
  currentOnboardingStepIndex: z.number().optional(),

  // Favorites (profile-specific)
  favoriteDancers: z.array(zid('dancers')).optional(),
  favoriteChoreographers: z.array(zid('choreographers')).optional(),

  // Profile data (migrated from users table)
  headshots: headshotsDbField,
  representation: representationDbField,
  representationStatus: z
    .enum(['represented', 'seeking', 'independent'])
    .optional(),
  attributes: z.object(attributesPlainObject).optional(),
  sizing: sizingDbField,
  resume: zResume.optional(), // Will be deprecated in Phase 2

  // Flattened resume fields (replacing nested resume structure)
  projects: z.array(zid('projects')).optional(),
  skills: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  resumeUploads: zFileUploadObjectArray.optional(),

  links: zLinks.optional(),

  // Dancer-specific fields
  sagAftraId: sagAftraIdDbField,
  training: z.array(zid('training')).optional(),
  workLocation: workLocationDbField, // Work location preferences

  // Search and discovery
  searchPattern: z.string().optional(), // For text search
  location: locationDbField, // For proximity search

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
export const Dancers = zodTable('dancers', dancers)
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
