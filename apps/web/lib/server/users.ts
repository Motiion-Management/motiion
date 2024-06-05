import 'server-only'

import { fetchQuery, preloadQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { redirect } from 'next/navigation'
import { Id } from '@packages/backend/convex/_generated/dataModel'

export async function me() {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.getMyUser, {}, { token })

  if (!user) {
    redirect('/sign-in')
  }
  return user
}

export async function preloadMe() {
  const token = await getAuthToken()
  const user = await preloadQuery(api.users.getMyUser, {}, { token })

  return user
}

export async function getPublicUser(id: Id<'users'>) {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.read, { id }, { token })

  if (!user) {
    redirect('/404')
  }
  return user
}
