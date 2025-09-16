import { zodTable } from '@packages/zodvex'
import { z } from 'zod'

export const eventTypes = {
  name: z.string()
}

export const zEventTypes = z.object(eventTypes)
export const EventTypes = zodTable('eventTypes', zEventTypes)
