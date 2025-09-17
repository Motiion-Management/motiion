import { query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'
import { zCrud } from 'zodvex'
import { Events } from './schemas/events'

export const { read } = zCrud(Events, query, mutation)

export const { create, update, destroy } = zCrud(Events, authQuery, authMutation)
