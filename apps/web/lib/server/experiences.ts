import 'server-only'

import { fetchQuery, preloadQuery, preloadedQueryResult } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { EXPERIENCE_TYPES } from '@packages/backend/convex/validators/experiences'

export async function fetchMyExperiences() {
  const token = await getAuthToken()
  return await fetchQuery(api.users.experiences.getMyExperiences, {}, { token })
}

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number]
export async function fetchMyExperiencesByType({
  type
}: {
  type: ExperienceType
}) {
  const token = await getAuthToken()
  return await fetchQuery(
    api.users.experiences.getMyExperiencesByType,
    { type },
    { token }
  )
}

export async function preloadMyExperiencesByType({
  type
}: {
  type: ExperienceType
}) {
  const token = await getAuthToken()
  const preloadedExperiences = await preloadQuery(
    api.users.experiences.getMyExperiencesByType,
    { type },
    { token }
  )

  const experiences = preloadedQueryResult(preloadedExperiences)

  return { preloadedExperiences, experiences }
}

export async function preloadMyExperiences() {
  const token = await getAuthToken()
  const preloadedResult = await preloadQuery(
    api.users.experiences.getMyExperiences,
    {},
    { token }
  )

  const result = preloadedQueryResult(preloadedResult)

  return [preloadedResult, result]
}

export async function getUserPublicExperiences(userId: Id<'users'>) {
  const token = await getAuthToken()
  return await fetchQuery(
    api.users.experiences.getUserPublicExperiences,
    { userId },
    { token }
  )
}
