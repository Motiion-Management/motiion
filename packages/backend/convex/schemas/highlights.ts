import { zid } from 'zodvex'
import { zodTable } from 'zodvex'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

// Highlights schema - career highlights for dancer/choreographer profiles
// Each highlight references a project and has a custom cover photo
export const highlights = {
  // Owner references
  userId: zid('users'),
  profileId: zid('dancers'), // Currently dancers only, can extend to choreographers later

  // Highlight data
  projectId: zid('projects'), // Reference to the project this highlights
  imageId: zid('_storage'), // Cover photo for this highlight (may differ from project media)

  // Ordering
  position: z.number(), // 0-9 for up to 10 highlights

  // Metadata
  createdAt: z.string() // ISO timestamp
}

export const zHighlights = z.object(highlights)

// Table definition with indexes
export const Highlights = zodTable('highlights', highlights)
export type HighlightDoc = Doc<'highlights'>

// Helper type for creating a new highlight
export const zCreateHighlightInput = zHighlights.omit({
  userId: true,
  createdAt: true
})

export type CreateHighlightInput = z.infer<typeof zCreateHighlightInput>
