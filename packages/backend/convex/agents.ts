import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Agents } from './schema'

export const { read } = crud(Agents, query, mutation)

export const { create, update, destroy } = crud(Agents, authQuery, authMutation)
