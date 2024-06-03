import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import Link from 'next/link'

export default async function DiscoverPage() {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.getMyUser, {}, { token })
  return (
    <div>
      {user ? <p>Logged in as {user.firstName}</p> : <p>Not logged in</p>}
      <h1>Discover</h1>
      <Link
        className="text-link-lg"
        href="/talent/discover/k975ppztj3ak1fcyen7jm7n5jn6s7bq2"
      >
        Jake Hebert
      </Link>
    </div>
  )
}
