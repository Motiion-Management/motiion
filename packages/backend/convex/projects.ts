import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud } from '@packages/zodvex'
import { Projects } from './schemas/projects'

export const { read } = zCrud(Projects, query, mutation)

export const { create, update, destroy } = zCrud(
  Projects,
  authQuery,
  authMutation
)
