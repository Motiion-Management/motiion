import { query, mutation, internalMutation } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { ProfileType } from './onboardingConfig'

// Get the active onboarding flow for a given profile type and version
export const getFlow = query({
  args: {
    version: v.string(),
    profileType: v.union(
      v.literal('dancer'),
      v.literal('choreographer'),
      v.literal('guest')
    )
  },
  returns: v.object({
    _id: v.id('onboardingFlows'),
    _creationTime: v.number(),
    version: v.string(),
    profileType: v.union(
      v.literal('dancer'),
      v.literal('choreographer'),
      v.literal('guest')
    ),
    steps: v.array(v.any()),
    decisionPoints: v.array(v.any()),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    description: v.optional(v.string())
  }),
  handler: async (ctx, { version, profileType }) => {
    // Find the active flow for this version and profile type
    const flow = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_version_and_profileType', (q) =>
        q.eq('version', version).eq('profileType', profileType)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .first()

    if (!flow) {
      throw new ConvexError(
        `No active onboarding flow found for version ${version} and profile type ${profileType}`
      )
    }

    return flow
  }
})

// Get all versions of onboarding flows
export const getAllVersions = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const flows = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .collect()

    // Extract unique versions
    const versions = [...new Set(flows.map((flow) => flow.version))]
    return versions.sort()
  }
})

// Create a new onboarding flow
export const createFlow = mutation({
  args: {
    version: v.string(),
    profileType: v.union(
      v.literal('dancer'),
      v.literal('choreographer'),
      v.literal('guest')
    ),
    steps: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        route: v.string(),
        required: v.array(v.string()),
        minItems: v.optional(v.number()),
        description: v.optional(v.string()),
        conditional: v.optional(
          v.object({
            field: v.string(),
            value: v.string(),
            show: v.boolean()
          })
        ),
        validation: v.optional(
          v.object({
            type: v.union(v.literal('backend'), v.literal('local')),
            endpoint: v.optional(v.string())
          })
        )
      })
    ),
    decisionPoints: v.array(
      v.object({
        stepId: v.string(),
        field: v.string(),
        branches: v.array(
          v.object({
            value: v.string(),
            nextStep: v.string()
          })
        )
      })
    ),
    description: v.optional(v.string())
  },
  returns: v.id('onboardingFlows'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    // Check if this version/profileType combo already exists
    const existing = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_version_and_profileType', (q) =>
        q.eq('version', args.version).eq('profileType', args.profileType)
      )
      .first()

    if (existing) {
      throw new ConvexError(
        `Flow already exists for version ${args.version} and profile type ${args.profileType}`
      )
    }

    const flowId = await ctx.db.insert('onboardingFlows', {
      version: args.version,
      profileType: args.profileType,
      steps: args.steps,
      decisionPoints: args.decisionPoints,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: identity.subject,
      description: args.description
    })

    return flowId
  }
})

// Update an existing flow
export const updateFlow = mutation({
  args: {
    flowId: v.id('onboardingFlows'),
    updates: v.object({
      steps: v.optional(
        v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            route: v.string(),
            required: v.array(v.string()),
            minItems: v.optional(v.number()),
            description: v.optional(v.string()),
            conditional: v.optional(
              v.object({
                field: v.string(),
                value: v.string(),
                show: v.boolean()
              })
            ),
            validation: v.optional(
              v.object({
                type: v.union(v.literal('backend'), v.literal('local')),
                endpoint: v.optional(v.string())
              })
            )
          })
        )
      ),
      decisionPoints: v.optional(
        v.array(
          v.object({
            stepId: v.string(),
            field: v.string(),
            branches: v.array(
              v.object({
                value: v.string(),
                nextStep: v.string()
              })
            )
          })
        )
      ),
      isActive: v.optional(v.boolean()),
      description: v.optional(v.string())
    })
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { flowId, updates }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    await ctx.db.patch(flowId, {
      ...updates,
      updatedAt: new Date().toISOString()
    })

    return { success: true }
  }
})

// Deactivate a flow
export const deactivateFlow = mutation({
  args: {
    flowId: v.id('onboardingFlows')
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { flowId }) => {
    await ctx.db.patch(flowId, {
      isActive: false,
      updatedAt: new Date().toISOString()
    })

    return { success: true }
  }
})

// Get the filtered flow for a user (excluding steps based on their choices)
export const getUserFlow = query({
  args: {
    version: v.optional(v.string())
  },
  returns: v.union(
    v.array(v.any()),
    v.object({
      steps: v.array(v.any()),
      decisionPoints: v.array(v.any()),
      version: v.string()
    })
  ),
  handler: async (ctx, { version = 'v2' }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .first()

    if (!user) {
      return []
    }

    const profileType = (user.profileType || 'dancer') as ProfileType

    // Get the base flow
    const flow = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_version_and_profileType', (q) =>
        q.eq('version', version).eq('profileType', profileType)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .first()

    if (!flow) {
      return []
    }

    // Apply conditional logic to filter steps
    const filteredSteps = flow.steps.filter((step) => {
      // Check if step has conditional visibility
      if (step.conditional) {
        const fieldValue = getFieldValue(user, step.conditional.field)
        const shouldShow =
          fieldValue === step.conditional.value
            ? step.conditional.show
            : !step.conditional.show
        return shouldShow
      }
      return true
    })

    // Return the flow with decision points for client-side navigation
    return {
      steps: filteredSteps,
      decisionPoints: flow.decisionPoints,
      version: flow.version
    }
  }
})

// Helper function to get field values from user object
function getFieldValue(user: any, field: string): any {
  // Handle nested fields like 'attributes.gender'
  if (field.includes('.')) {
    const parts = field.split('.')
    let value = user
    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined
      }
      value = value[part]
    }
    return value
  }
  return user[field]
}

// Get a specific step from a flow
export const getFlowStep = query({
  args: {
    version: v.string(),
    profileType: v.union(
      v.literal('dancer'),
      v.literal('choreographer'),
      v.literal('guest')
    ),
    stepId: v.string()
  },
  returns: v.union(
    v.object({
      id: v.string(),
      name: v.string(),
      route: v.string(),
      required: v.array(v.string()),
      minItems: v.optional(v.number()),
      description: v.optional(v.string()),
      conditional: v.optional(
        v.object({
          field: v.string(),
          value: v.string(),
          show: v.boolean()
        })
      ),
      validation: v.optional(
        v.object({
          type: v.union(v.literal('backend'), v.literal('local')),
          endpoint: v.optional(v.string())
        })
      )
    }),
    v.null()
  ),
  handler: async (ctx, { version, profileType, stepId }) => {
    const flow = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_version_and_profileType', (q) =>
        q.eq('version', version).eq('profileType', profileType)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .first()

    if (!flow) {
      return null
    }

    const step = flow.steps.find((s: any) => s.id === stepId)
    return step || null
  }
})

// Activate a specific flow version
export const activateFlow = mutation({
  args: {
    flowId: v.id('onboardingFlows')
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { flowId }) => {
    const flow = await ctx.db.get(flowId)
    if (!flow) {
      throw new ConvexError('Flow not found')
    }

    // Deactivate all other flows for this profile type
    const otherFlows = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_version_and_profileType', (q) =>
        q.eq('version', flow.version).eq('profileType', flow.profileType)
      )
      .filter((q) => q.neq(q.field('_id'), flowId))
      .collect()

    for (const otherFlow of otherFlows) {
      await ctx.db.patch(otherFlow._id, { isActive: false })
    }

    // Activate this flow
    await ctx.db.patch(flowId, { isActive: true })

    return { success: true }
  }
})

// Duplicate a flow to create a new version
export const duplicateFlow = mutation({
  args: {
    flowId: v.id('onboardingFlows'),
    newVersion: v.string()
  },
  returns: v.id('onboardingFlows'),
  handler: async (ctx, { flowId, newVersion }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Not authenticated')
    }

    const originalFlow = await ctx.db.get(flowId)
    if (!originalFlow) {
      throw new ConvexError('Flow not found')
    }

    // Check if new version already exists
    const existing = await ctx.db
      .query('onboardingFlows')
      .withIndex('by_version_and_profileType', (q) =>
        q.eq('version', newVersion).eq('profileType', originalFlow.profileType)
      )
      .first()

    if (existing) {
      throw new ConvexError(
        `Flow already exists for version ${newVersion} and profile type ${originalFlow.profileType}`
      )
    }

    // Create the duplicate
    const newFlowId = await ctx.db.insert('onboardingFlows', {
      version: newVersion,
      profileType: originalFlow.profileType,
      steps: originalFlow.steps,
      decisionPoints: originalFlow.decisionPoints,
      isActive: false, // New versions start inactive
      createdAt: new Date().toISOString(),
      createdBy: identity.subject,
      description: `Duplicated from ${originalFlow.version}`
    })

    return newFlowId
  }
})
