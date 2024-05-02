import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Experiences } from './schema'

export const { read } = crud(Experiences, query, mutation)

export const { create, update, destroy } = crud(
  Experiences,
  authQuery,
  authMutation
)
