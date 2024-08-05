import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { filter } from 'convex-helpers/server/filter'
import { Events } from './validators/events'
import { paginationOptsValidator } from 'convex/server'

export const { read } = crud(Events, query, mutation)

export const { create, update, destroy } = crud(Events, authQuery, authMutation)

export const paginate = query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, args) {
    const events = await filter(
      ctx.db.query('events'),
      async (event) => event.active
    )
      .withIndex('startDate')
      .order('desc')
      .paginate(args.paginationOpts)

    return events
  }
})
