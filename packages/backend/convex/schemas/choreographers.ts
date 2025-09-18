import { zid } from 'zodvex'
import { zodTable } from 'zodvex'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'
import { zFileUploadObjectArray, zLocation } from './base'
import { zRepresentation, zResume, zLinks } from './users'

// Choreographer-specific schema
export const choreographers = {
  // Link to user account
  userId: zid('users'),

  // Profile management
  isPrimary: z.boolean().default(true), // First profile created during onboarding
  createdAt: z.string(), // ISO date string

  // Profile data (common with dancers but may diverge)
  headshots: zFileUploadObjectArray.optional(),
  representation: zRepresentation.optional(),
  representationStatus: z
    .enum(['represented', 'seeking', 'independent'])
    .optional(),
  resume: zResume.optional(),
  links: zLinks.optional(),

  // Choreographer-specific fields
  companyName: z.string().optional(),
  databaseUse: z.string().optional(), // How they intend to use the database

  // Professional details
  specialties: z.array(z.string()).optional(), // Dance styles they choreograph
  yearsOfExperience: z.number().optional(),
  notableWorks: z.array(z.string()).optional(), // Notable productions/artists

  // Teaching/Workshop info (future)
  teachingLocations: z.array(zLocation).optional(),
  workshopSchedule: z.object({}).optional(), // Future: structured event data
  rates: z.object({
    hourly: z.number().optional(),
    daily: z.number().optional(),
    project: z.string().optional() // "Contact for quote" etc
  }).optional(),

  // Search and discovery
  searchPattern: z.string().optional(), // For text search
  location: zLocation.optional(), // Primary location
  verified: z.boolean().default(false), // Verification badge
  featured: z.boolean().default(false), // Featured choreographer status

  // Profile completeness
  profileCompleteness: z.number().default(0), // 0-100 percentage
  profileTipDismissed: z.boolean().optional(),

  // Import tracking
  resumeImportedFields: z.array(z.string()).optional(),
  resumeImportVersion: z.string().optional(),
  resumeImportedAt: z.string().optional(),

  // Future choreographer-specific features (placeholders)
  availability: z.object({}).optional(), // Calendar/availability system
  portfolio: zFileUploadObjectArray.optional(), // Work samples/videos
  certifications: z.array(z.string()).optional(),
  awardsRecognition: z.array(z.string()).optional()
}

export const zChoreographers = z.object(choreographers)

// Table definition with indexes
export const Choreographers = zodTable('choreographers', zChoreographers)
export type ChoreographerDoc = Doc<'choreographers'>

// Helper type for creating a new choreographer profile
export const zCreateChoreographerInput = zChoreographers.omit({
  userId: true,
  isPrimary: true,
  createdAt: true,
  profileCompleteness: true,
  searchPattern: true,
  verified: true,
  featured: true
})

export type CreateChoreographerInput = z.infer<typeof zCreateChoreographerInput>
