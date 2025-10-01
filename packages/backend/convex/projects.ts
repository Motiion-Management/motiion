import { zq, authMutation, zodDoc, zid } from './util'
import { z } from 'zod'
import { Doc } from './_generated/dataModel'

// Import schema from schemas folder
import { projects } from './schemas/projects'

const zProjectDoc = zodDoc('projects', projects)

// Public read
export const read = zq({
  args: { id: zid('projects') },
  returns: zProjectDoc.nullable(),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Authenticated create
export const create = authMutation({
  args: z.object(projects),
  returns: zid('projects'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('projects', args)
  }
})

// Authenticated update
export const update = authMutation({
  args: z.object({
    id: zid('projects'),
    patch: z.object(projects).partial()
  }),
  returns: z.null(),
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch)
    return null
  }
})

// Authenticated destroy
export const destroy = authMutation({
  args: { id: zid('projects') },
  returns: z.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return null
  }
})
