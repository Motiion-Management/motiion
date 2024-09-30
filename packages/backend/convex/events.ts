import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Events } from './validators/events'
import { paginationOptsValidator } from 'convex/server'

export const { read } = crud(Events, query, mutation)

export const { create, update, destroy } = crud(Events, authQuery, authMutation)

export const paginate = query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, args) {
    const events = await ctx.db
      .query('events')
      .withIndex('startDate')
      .filter((q) => q.eq(q.field('active'), true))
      .order('desc')
      .paginate(args.paginationOpts)

    return events
  }
})

export const paginateAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, args) {
    const events = await ctx.db
      .query('events')
      .withIndex('startDate')
      .order('desc')
      .paginate(args.paginationOpts)

    return events
  }
})
