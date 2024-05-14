import 'server-only'

import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { redirect } from 'next/navigation'

export async function me() {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.getMyUser, {}, { token })

  if (!user) {
    redirect('/sign-in')
  }
  return user
}
