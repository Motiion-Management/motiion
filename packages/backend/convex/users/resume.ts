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
  user: UserDoc,
  filterPublic: boolean = false
) {
  if (!user?.resume) return
  const { resume } = user

  const uploads = await Promise.all(
    (resume.uploads || []).map(async (resumeUpload: { storageId: Id<'_storage'>; title?: string; uploadDate: string }) => ({
      url: await ctx.storage.getUrl(resumeUpload.storageId),
      ...resumeUpload
    }))
  )

  const publicExperiences = await Promise.all(
    (resume.projects || []).map(async (projectId: Id<'projects'>) => {
      const project = await ctx.db.get(projectId)
      if (!project || (filterPublic && project.private)) return
      return project
    })
  )

  const experiences = EXPERIENCE_TYPES.map((type) =>
    publicExperiences.filter((e) => e?.type === type)
  )

  return {
    skills: resume.skills,
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
    let userWithResume = ctx.user

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.resume) {
        // Create a user object with profile's resume for augmentResume
        userWithResume = { ...ctx.user, resume: profile.resume as any }
      }
    }

    return await augmentResume(ctx as any, userWithResume)
  }
})

export const getMyExperienceCounts = authQuery({
  handler: async (ctx) => {
    // PROFILE-FIRST: Get resume from active profile if it exists
    let resume = ctx.user?.resume

    if (ctx.user?.activeProfileType && (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.resume) {
        resume = profile.resume as any
      }
    }

    const exp: any = resume?.projects
    // TODO: Type correctly when getAll returns proper types
    const experiences = exp ? (await getAll(ctx.db, exp)) as Doc<'projects'>[] : []

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
    const currentResume = profile?.resume || ctx.user.resume

    const resumeUploads = [
      ...args.resumeUploads,
      ...(currentResume?.uploads || [])
    ]

    const updatedResume = {
      ...currentResume,
      uploads: resumeUploads
    }

    await ctx.db.patch(targetId, {
      resume: updatedResume
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
    const currentResume = profile?.resume || ctx.user.resume

    const uploads = (currentResume?.uploads || []).filter(
      (h: { storageId: Id<'_storage'> }) => h.storageId !== args.resumeUploadId
    )

    const updatedResume = { ...currentResume, uploads }

    await ctx.db.patch(targetId, {
      resume: updatedResume
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

    const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)
    const currentResume = profile?.resume || ctx.user.resume

    const updatedResume = {
      ...currentResume,
      projects: args.projects,
      skills: args.skills,
      genres: args.genres
    }

    await ctx.db.patch(targetId, {
      resume: updatedResume
    })
  }
})