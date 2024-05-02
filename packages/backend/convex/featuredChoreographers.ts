import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { FeaturedChoreographers } from './schema'

export const { read } = crud(FeaturedChoreographers, query, mutation)

export const { create, update, destroy } = crud(
  FeaturedChoreographers,
  authQuery,
  authMutation
)
