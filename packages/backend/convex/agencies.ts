import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { crud } from 'convex-helpers/server'
import { Agencies } from './schema'
import { Doc } from './_generated/dataModel'

export type AgencyDoc = Doc<'agencies'>

export const { read } = crud(Agencies, query, mutation)

export const { create, update, destroy } = crud(
  Agencies,
  authQuery,
  authMutation
)
