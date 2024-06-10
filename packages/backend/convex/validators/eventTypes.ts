import { zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const eventTypes = {
  name: z.string()
}

export const zEventTypes = z.object(eventTypes)
export const EventTypes = Table('eventTypes', zodToConvexFields(eventTypes))
