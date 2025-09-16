import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud, zQuery } from '@packages/zodvex'
import { FeaturedContent } from './validators/featuredContent'

export const { read } = zCrud(FeaturedContent, query, mutation)

export const { create, update, destroy } = zCrud(
  FeaturedContent,
  authQuery,
  authMutation
)

export const getCurrent = zQuery(
  query,
  {},
  async (ctx) => {
    const featuredContent = await ctx.db.query('featuredContent').first()

    if (!featuredContent) return

    return {
      ...featuredContent,
      image: await ctx.storage.getUrl(featuredContent.media)
    }
  }
)
