import { query, mutation } from './_generated/server'
import { crud } from 'convex-helpers/server/crud'
import schema from './schema'
import { authMutation, authQuery } from './util'
import { Events } from './schemas/events'

export const { read } = crud(schema, 'events', query, mutation)

export const { create, update, destroy } = crud(schema, 'events', authQuery, authMutation)
