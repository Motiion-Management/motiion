import { defineSchema, defineTable } from 'convex/server'
import { Users } from './validators/users'
import { Events } from './validators/events'
import { EventTypes } from './validators/eventTypes'
import { FeaturedContent } from './validators/featuredContent'
import { FeaturedMembers } from './validators/featuredMembers'
import { Rewards } from './validators/rewards'
import { Agencies } from './validators/agencies'
import { Agents } from './validators/agents'
import { Experiences } from './validators/experiences'
import { v } from 'convex/values'

export default defineSchema(
  {
    // global
    featuredContent: FeaturedContent.table,
    featuredMembers: FeaturedMembers.table,
    rewards: Rewards.table,
    eventTypes: EventTypes.table,
    events: Events.table.index('attendanceCode', ['attendanceCode']),

    // user
    users: Users.table
      .index('tokenId', ['tokenId'])
      .searchIndex('search_user', {
        searchField: 'searchPattern'
      }),
    // resume data
    experiences: Experiences.table.index('userId', ['userId']),
    resumes: defineTable({
      displayRepresentation: v.optional(v.boolean()),
      ethnicity: v.optional(v.array(v.string())),
      eyeColor: v.optional(v.string()),
      hairColor: v.optional(v.string()),
      headshots: v.array(
        v.object({
          storageId: v.id('_storage'),
          title: v.string(),
          uploadDate: v.string()
        })
      ),
      height: v.optional(v.object({ feet: v.float64(), inches: v.float64() })),
      links: v.optional(
        v.object({
          portfolio: v.array(v.object({ link: v.string(), title: v.string() })),
          reel: v.string(),
          socials: v.array(
            v.object({
              link: v.string(),
              platform: v.string()
            })
          )
        })
      ),
      representation: v.optional(v.id('agencies')),
      resumeUploads: v.optional(
        v.array(
          v.object({
            storageId: v.id('_storage'),
            title: v.string(),
            uploadDate: v.string()
          })
        )
      ),
      sizing: v.optional(
        v.object({
          female: v.object({
            bust: v.optional(v.string()),
            cup: v.string(),
            underbust: v.optional(v.string())
          }),
          general: v.object({
            glove: v.string(),
            hat: v.string(),
            inseam: v.string(),
            waist: v.string()
          }),
          male: v.object({
            chest: v.optional(v.string()),
            coatLength: v.optional(v.string()),
            neck: v.string(),
            shirt: v.optional(v.string()),
            shoes: v.optional(v.string()),
            sleeve: v.optional(v.string())
          })
        })
      ),
      skills: v.optional(
        v.object({
          expert: v.array(v.string()),
          novice: v.array(v.string()),
          proficient: v.array(v.string())
        })
      ),
      userId: v.id('users'),
      yearsOfExperience: v.optional(v.float64())
    }),

    // agency
    agents: Agents.table.index('userId', ['userId']),
    agencies: Agencies.table.searchIndex('search_name', { searchField: 'name' })
  },
  {
    schemaValidation: false
  }
)
