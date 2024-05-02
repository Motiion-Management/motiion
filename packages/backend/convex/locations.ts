import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Locations } from './schema'

export const { read } = crud(Locations, query, mutation)

export const { create, update, destroy } = crud(
  Locations,
  authQuery,
  authMutation
)
