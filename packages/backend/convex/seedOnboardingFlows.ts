import { internalMutation } from './_generated/server'
import { v } from 'convex/values'

// Initial onboarding flow data
const INITIAL_FLOWS = {
  v2: {
    dancer: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'headshots',
        required: ['headshots'],
        minItems: 1,
        description: 'Upload professional headshots'
      },
      {
        step: 'height',
        required: ['height'],
        description: 'Your height information'
      },
      {
        step: 'ethnicity',
        required: ['ethnicity'],
        description: 'Your ethnicity'
      },
      {
        step: 'hair-color',
        required: ['hairColor'],
        description: 'Your hair color'
      },
      {
        step: 'eye-color',
        required: ['eyeColor'],
        description: 'Your eye color'
      },
      {
        step: 'gender',
        required: ['gender'],
        description: 'Your gender'
      },
      {
        step: 'sizing',
        required: ['sizing'],
        description: 'Clothing and measurement details'
      },
      {
        step: 'location',
        required: ['location'],
        description: 'Your location'
      },
      {
        step: 'work-location',
        required: ['workLocation'],
        description: 'Your work location preferences'
      },
      {
        step: 'representation',
        required: ['representationStatus'],
        description: 'Agency and representation information'
      },
      {
        step: 'agency',
        required: ['agency'],
        description: 'Agency selection'
      },
      {
        step: 'experiences',
        required: ['experiences'],
        minItems: 1,
        description: 'Professional experience'
      },
      {
        step: 'training',
        required: ['training'],
        description: 'Training and education'
      },
      {
        step: 'skills',
        required: ['skills'],
        description: 'Skills and abilities'
      },
      {
        step: 'union',
        required: ['unionStatus'],
        description: 'Union membership status'
      }
    ],
    choreographer: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'headshots',
        required: ['headshots'],
        minItems: 1,
        description: 'Upload professional headshots'
      },
      {
        step: 'location',
        required: ['location'],
        description: 'Your location'
      },
      {
        step: 'representation',
        required: ['representationStatus'],
        description: 'Agency and representation information'
      },
      {
        step: 'agency',
        required: ['agency'],
        description: 'Agency selection'
      },
      {
        step: 'experiences',
        required: ['experiences'],
        minItems: 1,
        description: 'Professional experience'
      }
    ],
    guest: [
      {
        step: 'profile-type',
        required: ['profileType'],
        description: 'Select your profile type'
      },
      {
        step: 'database-use',
        required: ['databaseUse'],
        description: 'How will you use the database'
      },
      {
        step: 'company',
        required: ['companyName'],
        description: 'Company or organization information'
      }
    ]
  }
}

// Seed initial onboarding flows into the database
export const seedInitialFlows = internalMutation({
  args: {},
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
    message: v.string()
  }),
  handler: async (ctx) => {
    let created = 0
    let skipped = 0

    for (const [version, flows] of Object.entries(INITIAL_FLOWS)) {
      for (const [profileType, steps] of Object.entries(flows)) {
        // Check if already exists
        const existing = await ctx.db
          .query('onboardingFlows')
          .withIndex('by_version_and_profileType', (q) =>
            q
              .eq('version', version)
              .eq(
                'profileType',
                profileType as 'dancer' | 'choreographer' | 'guest'
              )
          )
          .first()

        if (existing) {
          skipped++
          continue
        }

        // Transform steps to new format
        const transformedSteps = steps.map((step) => ({
          id: step.step,
          name: step.step,
          route: `/app/onboarding/${step.step}`,
          required: step.required,
          ...('minItems' in step && step.minItems !== undefined
            ? { minItems: step.minItems }
            : {}),
          description: step.description,
          // Add conditional for agency step
          conditional:
            step.step === 'agency'
              ? {
                  field: 'representationStatus',
                  value: 'represented',
                  show: true
                }
              : undefined,
          // Add validation configuration
          validation:
            step.step === 'agency'
              ? {
                  type: 'backend' as const,
                  endpoint: 'validateAgency'
                }
              : undefined
        }))

        // Add decision points
        const decisionPoints = []

        // Add representation decision point for dancer and choreographer
        if (profileType === 'dancer' || profileType === 'choreographer') {
          decisionPoints.push({
            stepId: 'representation',
            field: 'representationStatus',
            branches: [
              { value: 'represented', nextStep: 'agency' },
              {
                value: 'seeking',
                nextStep:
                  profileType === 'dancer' ? 'experiences' : 'experiences'
              },
              {
                value: 'independent',
                nextStep:
                  profileType === 'dancer' ? 'experiences' : 'experiences'
              }
            ]
          })
        }

        await ctx.db.insert('onboardingFlows', {
          version,
          profileType: profileType as 'dancer' | 'choreographer' | 'guest',
          steps: transformedSteps,
          decisionPoints,
          isActive: version === 'v2', // v2 is the current version
          createdAt: new Date().toISOString(),
          description: `${profileType} onboarding flow for version ${version}`
        })

        created++
      }
    }

    return {
      created,
      skipped,
      message: `Seeded ${created} onboarding flows, skipped ${skipped} existing flows`
    }
  }
})
