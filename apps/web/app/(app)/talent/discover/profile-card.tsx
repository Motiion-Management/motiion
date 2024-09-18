import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'
import { FC } from 'react'

export type Profile = { headshotUrl: string; label: string; userId: Id<'users'> }


export const DiscoverProfileCard: FC<Profile> = ({ headshotUrl, label, userId }) => {
  return (
    <Link href={`/talent/${userId}`} className="">
      <AspectRatio ratio={123 / 180} className="relative">
        <Skeleton
          className="h-full w-full absolute top-0 left-0 z-0"
        />
        <Image
          className="rounded-lg object-cover relative z-10"
          src={headshotUrl}
          layout="fill"
          alt={label}
        />
      </AspectRatio>
      <span className="text-h6">{label}</span>
    </Link>
  )
}

