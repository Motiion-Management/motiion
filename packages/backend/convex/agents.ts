import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud } from '@packages/zodvex'
import { Agents } from './validators/agents'

export const { read } = zCrud(Agents, query, mutation)

export const { create, update, destroy } = zCrud(Agents, authQuery, authMutation)
