import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { PointValues } from './schema'

export const { read } = crud(PointValues, query, mutation)

export const { create, update, destroy } = crud(
  PointValues,
  authQuery,
  authMutation
)
