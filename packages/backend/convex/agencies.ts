import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Agencies } from './schema'
import { Doc } from './_generated/dataModel'
import { v } from 'convex/values'

export type AgencyDoc = Doc<'agencies'>

export const { read } = crud(Agencies, query, mutation)

export const { create, update, destroy } = crud(
  Agencies,
  authQuery,
  authMutation
)

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const results = await ctx.db
      .query('agencies')
      .withSearchIndex('search_name', (q) => q.search('name', query))
      .filter((q) => q.eq(q.field('listed'), true))
      .take(10)

    return results
  }
})

export const getAgency = query({
  args: {
    id: v.optional(v.id('agencies'))
  },
  handler: async (ctx, args) => {
    if (!args.id) {
      return null
    }
    const agency = await ctx.db.get(args.id)

    if (!agency) {
      return null
    }
    return {
      ...agency,
      logo: agency.logo && (await ctx.storage.getUrl(agency.logo))
    }
  }
})
