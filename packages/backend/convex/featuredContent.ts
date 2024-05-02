import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { FeaturedContent } from './schema'

export const { read } = crud(FeaturedContent, query, mutation)

export const { create, update, destroy } = crud(
  FeaturedContent,
  authQuery,
  authMutation
)
