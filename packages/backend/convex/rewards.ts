import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud } from '@packages/zodvex'
import { Rewards } from './validators/rewards'

export const { read } = zCrud(Rewards, query, mutation)

export const { create, update, destroy } = zCrud(
  Rewards,
  authQuery,
  authMutation
)
