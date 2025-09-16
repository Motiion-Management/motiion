import { defineSchema } from 'convex/server'
import { Users } from './schemas/users'
import { Dancers } from './schemas/dancers'
import { Choreographers } from './schemas/choreographers'
import { Events } from './schemas/events'
import { FeaturedMembers } from './schemas/featuredMembers'
import { Agencies } from './schemas/agencies'
import { Projects } from './schemas/projects'
import { Training } from './schemas/training'
import { typedV } from 'convex-helpers/validators'

const schema = defineSchema(
  {
    // global
    featuredMembers: FeaturedMembers.table,
    events: Events.table
      .index('attendanceCode', ['attendanceCode'])
      .index('startDate', ['startDate']),

    // user accounts
    users: Users.table
      .index('tokenId', ['tokenId'])
      .searchIndex('search_user', {
        searchField: 'searchPattern'
      }),

    // profile tables
    dancers: Dancers.table
      .index('by_userId', ['userId'])
      .index('by_userId_and_active', ['userId', 'isActive'])
      .searchIndex('search_dancer', {
        searchField: 'searchPattern'
      }),

    choreographers: Choreographers.table
      .index('by_userId', ['userId'])
      .index('by_userId_and_active', ['userId', 'isActive'])
      .index('by_verified', ['verified'])
      .searchIndex('search_choreographer', {
        searchField: 'searchPattern'
      }),

    // projects table (will need profileId later)
    projects: Projects.table.index('userId', ['userId']),

    // training (primarily for dancers)
    training: Training.table.index('by_userId', ['userId']),

    // agency
    agencies: Agencies.table.searchIndex('search_name', { searchField: 'name' })
  }
  // {
  //   // ONLY ENABLE WHEN DOING SCHEMA MIGRATION
  //   schemaValidation: false
  // }
)

export default schema
export const vv = typedV(schema)
