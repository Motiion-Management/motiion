'use client'
import {
  EXPERIENCE_TITLE_MAP,
  EXPERIENCE_TYPES
} from '@packages/backend/convex/validators/experiences'
import { UserDoc } from '@packages/backend/convex/validators/users'
import { usePathname } from 'next/navigation'

const getTitle = (segment: string) => {
  if (EXPERIENCE_TYPES.includes(segment as (typeof EXPERIENCE_TYPES)[number])) {
    return EXPERIENCE_TITLE_MAP[segment as (typeof EXPERIENCE_TYPES)[number]]
  } else {
    return segment
  }
}

export function EditHeaderBody({ user }: { user: Partial<UserDoc> }) {
  const pathname = usePathname()

  const segments = pathname
    .replace('/talent/profile/edit', '')
    .split('/')
    .filter(Boolean)

  const title = getTitle(segments[segments.length - 1])
  const section = segments[segments.length - 2]

  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-primary text-h3 flex-1 capitalize">{title}</h1>
      <span className="text-label-xs uppercase">
        {user.fullName} / {section}
      </span>
    </div>
  )
}
