import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud } from '@packages/zodvex'
import { EventTypes } from './validators/eventTypes'

export const { read } = zCrud(EventTypes, query, mutation)

export const { create, update, destroy } = zCrud(
  EventTypes,
  authQuery,
  authMutation
)
