import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'

export default async function ProfilePage() {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.getMyUser, {}, { token })
  return (
    <div>
      {user ? <p>Logged in as {user.firstName}</p> : <p>Not logged in</p>}
      <h1>My Profile</h1>
    </div>
  )
}