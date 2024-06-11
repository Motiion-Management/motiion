import {
  query,
  mutation,
  internalQuery,
  internalMutation
} from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Agencies } from './validators/agencies'
import { Doc } from './_generated/dataModel'
import { v } from 'convex/values'

export type AgencyDoc = Doc<'agencies'>

export const { read } = crud(Agencies, query, mutation)

export const { create, update, destroy } = crud(
  Agencies,
  authQuery,
  authMutation
)

export const { read: internalRead } = crud(
  Agencies,
  internalQuery,
  internalMutation
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

type AgencyDocWithLogo = AgencyDoc & { logoUrl: string | null }

export const getAgency = query({
  args: {
    id: v.optional(v.id('agencies'))
  },
  handler: async (ctx, args): Promise<AgencyDocWithLogo | null> => {
    if (!args.id) {
      return null
    }
    const agency: AgencyDoc | null = await ctx.db.get(args.id)

    if (!agency) {
      return null
    }
    let logoUrl: string | null = null
    if (agency.logo) {
      logoUrl = await ctx.storage.getUrl(agency.logo)
    }
    return {
      ...agency,
      logoUrl
    }
  }
})
