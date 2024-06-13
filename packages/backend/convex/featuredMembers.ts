import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { FeaturedMembers } from './validators/featuredMembers'

export const { read } = crud(FeaturedMembers, query, mutation)

export const { create, update, destroy } = crud(
  FeaturedMembers,
  authQuery,
  authMutation
)
