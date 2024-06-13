import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Events } from './validators/events'

export const { read } = crud(Events, query, mutation)

export const { create, update, destroy } = crud(Events, authQuery, authMutation)
