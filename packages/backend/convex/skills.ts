import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Skills } from './schema'

export const { read } = crud(Skills, query, mutation)

export const { create, update, destroy } = crud(Skills, authQuery, authMutation)
