import {
  query,
  mutation,
  internalQuery,
  internalMutation
} from './_generated/server'
import { crud } from 'convex-helpers/server/crud'
import schema from './schema'
import { authMutation, authQuery, zq } from './util'
import { zid, zodDoc } from '@packages/zodvex'
import { z } from 'zod'
import { Agencies, zAgencies } from './schemas/agencies'
import { Doc } from './_generated/dataModel'

export type AgencyDoc = Doc<'agencies'>

// Public CRUD operations
export const { read } = crud(schema, 'agencies', query, mutation)

// Authenticated CRUD operations
export const { create, update, destroy } = crud(
  schema,
  'agencies',
  authQuery,
  authMutation
)

// Internal CRUD operations
export const { read: internalRead } = crud(
  schema,
  'agencies',
  internalQuery,
  internalMutation
)

const zAgencyDoc = zodDoc('agencies', zAgencies)

export const search = zq({
  args: { query: z.string() },
  returns: z.array(zAgencyDoc),
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
const zAgencyDocWithLogo = zAgencyDoc.extend({ logoUrl: z.string().nullable() })

export const getAgency = zq({
  args: { id: zid('agencies').optional() },
  returns: zAgencyDocWithLogo.nullable(),
  handler: async (ctx, args) => {
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
