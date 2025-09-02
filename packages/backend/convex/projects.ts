import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Projects } from './validators/projects'

export const { read } = crud(Projects, query, mutation)

export const { create, update, destroy } = crud(
  Projects,
  authQuery,
  authMutation
)
