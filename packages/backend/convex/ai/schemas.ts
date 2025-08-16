import { z } from 'zod'

// Experience type schema
export const experienceSchema = z.object({
  type: z.enum(['tv-film', 'music-video', 'live-performance', 'commercial']),
  title: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  roles: z.array(z.string()).optional(),
  // TV/Film specific
  studio: z.string().optional(),
  // Music Video specific
  artists: z.array(z.string()).optional(),
  // Commercial specific
  companyName: z.string().optional(),
  productionCompany: z.string().optional(),
  // Live Performance specific
  tourArtist: z.string().optional(),
  venue: z.string().optional(),
  subtype: z.enum([
    'festival',
    'tour', 
    'concert',
    'corporate',
    'award-show',
    'theater',
    'other'
  ]).optional(),
  // Team fields
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional()
})

// Training entry schema
export const trainingSchema = z.object({
  type: z.enum([
    'education',
    'dance-school', 
    'programs-intensives',
    'scholarships',
    'other'
  ]),
  institution: z.string(),
  instructors: z.array(z.string()).optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  degree: z.string().optional()
})

// Complete parsed resume schema
export const resumeSchema = z.object({
  experiences: z.array(experienceSchema),
  training: z.array(trainingSchema),
  skills: z.array(z.string()),
  genres: z.array(z.string()),
  sagAftraId: z.string().optional()
})

export type ParsedExperience = z.infer<typeof experienceSchema>
export type ParsedTraining = z.infer<typeof trainingSchema>
export type ParsedResumeData = z.infer<typeof resumeSchema>