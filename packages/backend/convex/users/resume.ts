import { QueryCtx, query } from '../_generated/server'
import { authMutation, authQuery, zq } from '../util'
import { z } from 'zod'
import { zid } from 'zodvex'
import { UserDoc, resume as resumeObj } from '../schemas/users'
import type { Id, Doc } from '../_generated/dataModel'
import { zFileUploadObjectArray } from '../schemas/base'
import {
  PROJECT_TITLE_MAP as EXPERIENCE_TITLE_MAP,
  PROJECT_TYPES as EXPERIENCE_TYPES
} from '../schemas/projects'
import { getAll } from 'convex-helpers/server/relationships'
import { getActiveProfileTarget } from './profileHelpers'

export async function augmentResume(
  ctx: QueryCtx,
  user: any,
  filterPublic: boolean = false
) {
  // Use flattened fields with fallback to nested resume for backward compatibility
  const projects = (user as any).projects || user?.resume?.projects
  const skills = (user as any).skills || user?.resume?.skills
  const resumeUploads = (user as any).resumeUploads || user?.resume?.uploads

  if (!projects && !skills && !resumeUploads) return

  const uploads = await Promise.all(
    (resumeUploads || []).map(
      async (resumeUpload: {
        storageId: Id<'_storage'>
        title?: string
        uploadDate: string
      }) => ({
        url: await ctx.storage.getUrl(resumeUpload.storageId),
        ...resumeUpload
      })
    )
  )

  const publicExperiences = await Promise.all(
    (projects || []).map(async (projectId: Id<'projects'>) => {
      const project = await ctx.db.get(projectId)
      if (!project || (filterPublic && project.private)) return
      return project
    })
  )

  const experiences = EXPERIENCE_TYPES.map((type) =>
    publicExperiences.filter((e) => e?.type === type)
  )

  return {
    skills,
    experiences,
    uploads
  }
}
export const getResume = zq({
  args: { userId: zid('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) return

    return await augmentResume(ctx, user, true)
  }
})

export const getMyResume = authQuery({
  handler: async (ctx) => {
    if (!ctx.user) return

    // PROFILE-FIRST: Get resume from active profile if it exists
    let dataSource = ctx.user

    if (
      ctx.user.activeProfileType &&
      (ctx.user.activeDancerId || ctx.user.activeChoreographerId)
    ) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile) {
        // Use profile as data source (has flattened fields + fallback to nested resume)
        dataSource = profile as any
      }
    }

    return await augmentResume(ctx as any, dataSource)
  }
})

export const getMyExperienceCounts = authQuery({
  handler: async (ctx) => {
    // PROFILE-FIRST: Get projects from active profile if it exists
    let projects = ctx.user?.resume?.projects

    if (
      ctx.user?.activeProfileType &&
      (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)
    ) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile) {
        // Use flattened field with fallback to nested resume
        projects = (profile as any).projects || (profile as any).resume?.projects
      }
    }

    const exp: any = projects
    // TODO: Type correctly when getAll returns proper types
    const experiences = exp
      ? ((await getAll(ctx.db, exp)) as Doc<'projects'>[])
      : []

    return EXPERIENCE_TYPES.map((type) => ({
      count: experiences.filter((e) => e?.type === type).length,
      title: EXPERIENCE_TITLE_MAP[type],
      slug: type
    }))
  }
})

export const getUserPublicExperienceCounts = zq({
  args: { id: zid('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id)

    const exp: any = user?.resume?.projects
    const experiences = (exp ? await getAll(ctx.db as any, exp) : []).filter(
      (e) => !e?.private
    )

    return EXPERIENCE_TYPES.map((type) => ({
      count: experiences.filter((e) => e?.type === type).length,
      title: EXPERIENCE_TITLE_MAP[type],
      slug: type
    }))
  }
})

export const saveResumeUploadIds = authMutation({
  args: { resumeUploads: zFileUploadObjectArray },
  handler: async (ctx, args) => {
    if (!ctx.user) return

    const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)

    // Use flattened field with fallback to nested resume for backward compatibility
    const currentUploads = profile?.resumeUploads || profile?.resume?.uploads || ctx.user.resume?.uploads || []

    const resumeUploads = [
      ...args.resumeUploads,
      ...currentUploads
    ]

    // Write to flattened field
    await ctx.db.patch(targetId, {
      resumeUploads
    })
  }
})

export const removeResumeUpload = authMutation({
  args: { resumeUploadId: zid('_storage') },
  handler: async (ctx, args) => {
    if (!ctx.user) {
      return
    }

    await ctx.storage.delete(args.resumeUploadId)

    const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)

    // Use flattened field with fallback to nested resume for backward compatibility
    const currentUploads = profile?.resumeUploads || profile?.resume?.uploads || ctx.user.resume?.uploads || []

    const uploads = currentUploads.filter(
      (h: { storageId: Id<'_storage'> }) => h.storageId !== args.resumeUploadId
    )

    // Write to flattened field
    await ctx.db.patch(targetId, {
      resumeUploads: uploads
    })
  }
})

export const updateMyResume = authMutation({
  args: {
    projects: resumeObj.projects,
    skills: resumeObj.skills,
    genres: resumeObj.genres
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return

    const { targetId } = await getActiveProfileTarget(ctx.db, ctx.user)

    // Write to flattened fields (no longer writing to nested resume object)
    await ctx.db.patch(targetId, {
      projects: args.projects,
      skills: args.skills,
      genres: args.genres
    })
  }
})
