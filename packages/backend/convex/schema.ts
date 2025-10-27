import { defineSchema } from 'convex/server'
import { Users } from './schemas/users'
import { Dancers } from './schemas/dancers'
import { Choreographers } from './schemas/choreographers'
import { FeaturedMembers } from './schemas/featuredMembers'
import { Agencies } from './schemas/agencies'
import { Projects } from './schemas/projects'
import { Training } from './schemas/training'
import { Highlights } from './schemas/highlights'
import { typedV } from 'convex-helpers/validators'

const schema = defineSchema(
  {
    // global
    featuredMembers: FeaturedMembers.table,

    // user accounts
    users: Users.table.index('tokenId', ['tokenId']),

    // profile tables
    dancers: Dancers.table
      .index('by_userId', ['userId'])
      .searchIndex('search_dancer', {
        searchField: 'searchPattern'
      }),

    choreographers: Choreographers.table
      .index('by_userId', ['userId'])
      .index('by_verified', ['verified'])
      .searchIndex('search_choreographer', {
        searchField: 'searchPattern'
      }),

    // projects table with profile-aware indexes
    projects: Projects.table
      .index('userId', ['userId'])
      .index('by_profileId', ['profileId']),

    // training (for both dancers and choreographers)
    training: Training.table
      .index('by_userId', ['userId'])
      .index('by_profileId', ['profileId']),

    // highlights (career highlights for profiles)
    highlights: Highlights.table
      .index('by_profileId', ['profileId'])
      .index('by_position', ['position']),

    // agency
    agencies: Agencies.table.searchIndex('search_name', { searchField: 'name' })
  },
  {
    // ONLY ENABLE WHEN DOING SCHEMA MIGRATION
    schemaValidation: true
  }
)

export default schema
export const vv = typedV(schema)
