import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Resumes } from './schema'

export const { read } = crud(Resumes, query, mutation)

export const { create, update, destroy } = crud(
  Resumes,
  authQuery,
  authMutation
)
