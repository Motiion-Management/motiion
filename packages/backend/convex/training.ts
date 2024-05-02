import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Training } from './schema'

export const { read } = crud(Training, query, mutation)

export const { create, update, destroy } = crud(
  Training,
  authQuery,
  authMutation
)
