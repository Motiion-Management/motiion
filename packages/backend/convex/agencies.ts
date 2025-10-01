import { ConvexError } from 'convex/values'
import { zq, authMutation, ziq } from './util'
import { zid, zodDoc } from '@packages/zodvex'
import { z } from 'zod'
import { Agencies, zAgencies } from './schemas/agencies'
import { Doc, Id } from './_generated/dataModel'

export type AgencyDoc = Doc<'agencies'>

const zAgencyDoc = zodDoc('agencies', zAgencies)

// Public read
export const read = zq({
  args: { id: zid('agencies') },
  returns: zAgencyDoc.nullable(),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Authenticated create
export const create = authMutation({
  args: zAgencies,
  returns: zid('agencies'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('agencies', args)
  }
})

// Authenticated update
export const update = authMutation({
  args: z.object({
    id: zid('agencies'),
    patch: zAgencies.partial()
  }),
  returns: z.null(),
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch)
    return null
  }
})

// Authenticated destroy
export const destroy = authMutation({
  args: { id: zid('agencies') },
  returns: z.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return null
  }
})

// Internal read
export const internalRead = ziq({
  args: { id: zid('agencies') },
  returns: zAgencyDoc.nullable(),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

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
