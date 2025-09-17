import { zid } from 'zodvex'
import { zodTable } from 'zodvex'
import { z } from 'zod'
import { zLocation } from './base'

export const agencies = {
  name: z.string(),
  listed: z.boolean().optional(),
  shortName: z.string().optional(),
  logo: z.string().optional(),
  websiteUrl: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: zLocation.optional(),
  ownerId: zid('users').optional(),
  managerList: z.array(zid('users')).optional()
}

export const zAgencies = z.object(agencies)

export const Agencies = zodTable('agencies', zAgencies)
