import { zq, authMutation, zid } from './util'
import { z } from 'zod'
import { Events, events } from './schemas/events'

const zEventsDoc = Events.zDoc

// Public read
export const read = zq({
  args: { id: zid('events') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Authenticated create
export const create = authMutation({
  args: events,
  returns: zid('events'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('events', args)
  }
})

// Authenticated update
export const update = authMutation({
  args: {
    id: zid('events'),
    patch: z.any()
  },
  returns: z.null(),
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch)
    return null
  }
})

// Authenticated destroy
export const destroy = authMutation({
  args: { id: zid('events') },
  returns: z.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return null
  }
})
