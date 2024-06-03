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

export const getAgency = query({
  args: {
    id: v.id('agencies')
  },
  handler: async (ctx, args) => {
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
