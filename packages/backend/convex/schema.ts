import { defineSchema } from 'convex/server'
import { Users } from './validators/users'
import { Events } from './validators/events'
import { FeaturedMembers } from './validators/featuredMembers'
import { Agencies } from './validators/agencies'
import { Projects } from './validators/projects'
import { Training } from './validators/training'
import { typedV } from 'convex-helpers/validators'

const schema = defineSchema(
  {
    // global
    featuredMembers: FeaturedMembers.table,
    events: Events.table
      .index('attendanceCode', ['attendanceCode'])
      .index('startDate', ['startDate']),

    // user
    users: Users.table
      .index('tokenId', ['tokenId'])
      .searchIndex('search_user', {
        searchField: 'searchPattern'
      }),

    // projects table
    projects: Projects.table.index('userId', ['userId']),

    // training
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
