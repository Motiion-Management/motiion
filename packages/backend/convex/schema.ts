import { defineSchema } from 'convex/server'
import { Users } from './validators/users'
import { Events } from './validators/events'
import { EventTypes } from './validators/eventTypes'
import { FeaturedContent } from './validators/featuredContent'
import { FeaturedMembers } from './validators/featuredMembers'
import { Rewards } from './validators/rewards'
import { Agencies } from './validators/agencies'
import { Agents } from './validators/agents'
import { Experiences } from './validators/experiences'

export default defineSchema({
  // global
  featuredContent: FeaturedContent.table,
  featuredMembers: FeaturedMembers.table,
  rewards: Rewards.table,
  eventTypes: EventTypes.table,
  events: Events.table
    .index('attendanceCode', ['attendanceCode'])
    .index('startDate', ['startDate']),

  // user
  users: Users.table.index('tokenId', ['tokenId']).searchIndex('search_user', {
    searchField: 'searchPattern'
  }),
  // resume data
  experiences: Experiences.table.index('userId', ['userId']),

  // agency
  agents: Agents.table.index('userId', ['userId']),
  agencies: Agencies.table.searchIndex('search_name', { searchField: 'name' })
  // },
  // {
  //   // ONLY ENABLE WHEN DOING SCHEMA MIGRATION
  //   schemaValidation: false
})
