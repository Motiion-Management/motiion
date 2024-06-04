import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
      {/* {users.page.map((user) => (
        <Link
          key={user._id}
          className="text-link-lg"
          href={`/talent/${user._id}`}
        >
          <Button>
            {user.firstName} {user.lastName}
          </Button>
        </Link>
      ))} */}
       <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4" />
            <Input
              type="search"
              placeholder="Search for dance artists."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] text-primary"
            />
    </div>
    </div>
  )
}
