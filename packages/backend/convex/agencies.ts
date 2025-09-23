import {
  query,
  mutation,
  internalQuery,
  internalMutation
} from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud, zQuery } from 'zodvex'
import { z } from 'zod'
import { zid } from 'zodvex'
import { Agencies, zAgencies } from './schemas/agencies'
import { Doc } from './_generated/dataModel'

export type AgencyDoc = Doc<'agencies'>

// Public CRUD operations
export const { read } = zCrud(Agencies, query, mutation)

// Authenticated CRUD operations
export const { create, update, destroy } = zCrud(
  Agencies,
  authQuery,
  authMutation
)

// Internal CRUD operations
export const { read: internalRead } = zCrud(
  Agencies,
  internalQuery,
  internalMutation
)

const zAgencyDoc = zAgencies.extend({
  _id: zid('agencies'),
  _creationTime: z.number()
})

export const search = zQuery(
  query,
  { query: z.string() },
  async (ctx, { query }) => {
    const results = await ctx.db
      .query('agencies')
      .withSearchIndex('search_name', (q: any) => q.search('name', query))
      .filter((q: any) => q.eq(q.field('listed'), true))
      .take(10)

    // Let zodvex validate returns; cast for TS
    return results as z.infer<typeof zAgencyDoc>[]
  },
  { returns: z.array(zAgencyDoc) }
)

type AgencyDocWithLogo = AgencyDoc & { logoUrl: string | null }

export const getAgency = zQuery(
  query,
  { id: zid('agencies').optional() },
  async (ctx, args) => {
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
    const withLogo = { ...agency, logoUrl }
    return withLogo as z.infer<typeof zAgencyDoc> & { logoUrl: string | null }
  },
  {
    returns: z.union([
      zAgencyDoc.extend({ logoUrl: z.union([z.string(), z.null()]) }),
      z.null()
    ])
  }
)
