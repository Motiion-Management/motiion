import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud, zQuery } from '@packages/zodvex'
import { z } from 'zod'
import { filter } from 'convex-helpers/server/filter'
import { Events } from './validators/events'

export const { read } = zCrud(Events, query, mutation)

export const { create, update, destroy } = zCrud(Events, authQuery, authMutation)

export const paginate = zQuery(
  query,
  { paginationOpts: z.any() },
  async (ctx, args) => {
    const events = await filter(
      ctx.db.query('events'),
      async (event: any) => event.active
    )
      .withIndex('startDate')
      .filter((q: any) => q.eq(q.field('active'), true))
      .order('desc')
      .paginate(args.paginationOpts)

    return events
  }
)
