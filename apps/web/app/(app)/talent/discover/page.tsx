import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DiscoverPage() {
  const token = await getAuthToken()
  const users = await fetchQuery(
    api.users.paginate,
    { paginationOpts: { numItems: 10, cursor: null } },
    { token }
  )

  return (
    <div className="flex flex-col gap-2">
      <h1>Discover</h1>
      {users.page.map((user) => (
        <Link
          key={user._id}
          className="text-link-lg"
          href={`/talent/${user._id}`}
        >
          <Button>
            {user.firstName} {user.lastName}
          </Button>
        </Link>
      ))}
    </div>
  )
}
