'use client'
import { UserDoc } from '@packages/backend/convex/validators/users'
import { usePathname } from 'next/navigation'

export function EditHeaderBody({ user }: { user: Partial<UserDoc> }) {
  const pathname = usePathname()

  const segments = pathname
    .replace('/talent/profile/edit', '')
    .split('/')
    .filter(Boolean)

  const page = segments[segments.length - 1]
  const section = segments[segments.length - 2]

  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-primary text-h3 flex-1 capitalize">{page}</h1>
      <span className="text-label-xs uppercase">
        {user.fullName} / {section}
      </span>
    </div>
  )
}
