import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Rewards } from './validators/rewards'

export const { read } = crud(Rewards, query, mutation)

export const { create, update, destroy } = crud(
  Rewards,
  authQuery,
  authMutation
)
