import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { EventTypes } from './validators/eventTypes'

export const { read } = crud(EventTypes, query, mutation)

export const { create, update, destroy } = crud(
  EventTypes,
  authQuery,
  authMutation
)
