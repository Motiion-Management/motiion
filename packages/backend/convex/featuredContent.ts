import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { FeaturedContent } from './validators/featuredContent'

export const { read } = crud(FeaturedContent, query, mutation)

export const { create, update, destroy } = crud(
  FeaturedContent,
  authQuery,
  authMutation
)

export const getCurrent = query({
  args: {},
  async handler(ctx) {
    const featuredContent = await ctx.db.query('featuredContent').first()

    if (!featuredContent) return

    return { ...featuredContent, image: await ctx.storage.getUrl(featuredContent.media) }

  }
})
