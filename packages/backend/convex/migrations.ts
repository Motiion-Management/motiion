import { internalMutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'

// Define migration to copy experiences to projects
export const copyExperiencesToProjects = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const experiences = await ctx.db.query('experiences').collect()
    
    for (const experience of experiences) {
    // Check if already migrated (idempotency)
    const existing = await ctx.db
      .query('projects')
      .withIndex('userId', q => q.eq('userId', experience.userId))
      .filter(q => q.eq(q.field('title'), experience.title))
      .first()
    
    if (!existing) {
      // Copy to projects table, preserving all fields except system fields
      const { _id, _creationTime, ...data } = experience
      await ctx.db.insert('projects', data)
    }
    }
    return null
  }
})

// Helper to create ID mapping for foreign key updates
export const createIdMapping = internalQuery({
  args: {},
  returns: v.array(v.object({
    oldId: v.id('experiences'),
    newId: v.id('projects')
  })),
  handler: async (ctx) => {
    const experiences = await ctx.db.query('experiences').collect()
    const mapping = []
    
    for (const exp of experiences) {
      const project = await ctx.db
        .query('projects')
        .withIndex('userId', q => q.eq('userId', exp.userId))
        .filter(q => q.eq(q.field('title'), exp.title))
        .first()
      
      if (project) {
        mapping.push({ oldId: exp._id, newId: project._id })
      }
    }
    
    return mapping
  }
})

// Define migration to update user references
export const updateUserReferences = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    
    for (const user of users) {
      if (!user.resume?.experiences || user.resume.experiences.length === 0) {
        continue // Skip users without experiences
      }
      
      // Get the ID mapping
      const mapping = await ctx.runQuery(internal.migrations.createIdMapping)
      const idMap = new Map(mapping.map(m => [m.oldId, m.newId]))
      
      // Map old IDs to new IDs
      const newProjectIds = user.resume.experiences
        .map(expId => idMap.get(expId))
        .filter(Boolean) // Remove any unmapped IDs
      
      // Update user's resume with new project IDs
      await ctx.db.patch(user._id, {
        resume: {
          ...user.resume,
          experiences: newProjectIds // This will become "projects" in code changes
        }
      })
    }
    return null
  }
})

// Master migration runner - run all migrations in sequence
export const runFullMigration = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  returns: v.object({
    experiencesCopied: v.number(),
    usersUpdated: v.number(),
    errors: v.array(v.string())
  }),
  handler: async (ctx, { dryRun = false }) => {
    const errors = []
    let experiencesCopied = 0
    let usersUpdated = 0
    
    try {
      if (!dryRun) {
        // Run the copy migration
        await ctx.runMutation(internal.migrations.copyExperiencesToProjects)
        const projects = await ctx.db.query('projects').collect()
        experiencesCopied = projects.length
        
        // Run the user references update
        await ctx.runMutation(internal.migrations.updateUserReferences)
        const users = await ctx.db.query('users').collect()
        usersUpdated = users.filter(u => u.resume?.experiences?.length > 0).length
      } else {
        // Dry run - just count
        const experiences = await ctx.db.query('experiences').collect()
        experiencesCopied = experiences.length
        
        const users = await ctx.db.query('users').collect()
        usersUpdated = users.filter(u => u.resume?.experiences?.length > 0).length
      }
    } catch (error: any) {
      errors.push(error.message || 'Unknown error')
    }
    
    return { experiencesCopied, usersUpdated, errors }
  }
})

// Verification query to check migration status
export const verifyMigration = internalQuery({
  args: {},
  returns: v.object({
    experiencesCount: v.number(),
    projectsCount: v.number(),
    usersWithExperiences: v.number(),
    usersWithProjects: v.number(),
    unmappedExperiences: v.array(v.id('experiences')),
    isComplete: v.boolean()
  }),
  handler: async (ctx) => {
    const experiences = await ctx.db.query('experiences').collect()
    const experiencesCount = experiences.length
    
    const projects = await ctx.db.query('projects').collect()
    const projectsCount = projects.length
    
    // Check user references
    const users = await ctx.db.query('users').collect()
    const usersWithExperiences = users.filter(u => u.resume?.experiences?.length > 0).length
    
    // Count users that have been migrated (have project IDs)
    let usersWithProjects = 0
    for (const user of users) {
      if (user.resume?.experiences?.length > 0) {
        // Check if all experience IDs are valid project IDs
        let allMigrated = true
        for (const expId of user.resume.experiences) {
          // Try to get as project - will fail if not migrated
          try {
            const project = await ctx.db.get(expId as any)
            if (!project) {
              allMigrated = false
              break
            }
          } catch {
            allMigrated = false
            break
          }
        }
        if (allMigrated) {
          usersWithProjects++
        }
      }
    }
    
    // Find unmapped experiences
    const unmapped = []
    for (const exp of experiences) {
      const project = await ctx.db
        .query('projects')
        .withIndex('userId', q => q.eq('userId', exp.userId))
        .filter(q => q.eq(q.field('title'), exp.title))
        .first()
      if (!project) {
        unmapped.push(exp._id)
      }
    }
    
    return {
      experiencesCount,
      projectsCount,
      usersWithExperiences,
      usersWithProjects,
      unmappedExperiences: unmapped,
      isComplete: experiencesCount === projectsCount && unmapped.length === 0
    }
  }
})

