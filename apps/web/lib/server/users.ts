import 'server-only'

import { fetchQuery, preloadQuery, preloadedQueryResult } from 'convex/nextjs'
import {
  getAuthToken,
  preloadHelper,
  preloadHelperWithToken
} from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { redirect } from 'next/navigation'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { Preloaded } from 'convex/react'
import { UserDoc } from '@packages/backend/convex/validators/users'

export async function me() {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.getMyUser, {}, { token })

  if (!user) {
    redirect('/sign-in')
  }
  return user
}

export async function preloadMe() {
  return preloadHelperWithToken(api.users.getMyUser, {}, 'users')
}

export async function getPublicUser(id: Id<'users'>) {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.read, { id }, { token })

  if (!user) {
    redirect('/404')
  }
  return user
}
