import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Agencies } from './schema'

export const { read } = crud(Agencies, query, mutation)

export const { create, update, destroy } = crud(
  Agencies,
  authQuery,
  authMutation
)
