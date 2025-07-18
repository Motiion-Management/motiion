import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'
import { FC } from 'react'

export type Profile = {
  headshotUrl: string
  label: string
  userId: string  // Changed from Id<'users'> to string to match backend response
}

export const DiscoverProfileCard: FC<Profile> = ({
  headshotUrl,
  label,
  userId
}) => {
  return (
    <Link href={`/talent/${userId}`} className="">
      <AspectRatio ratio={123 / 180} className="relative">
        <Skeleton className="absolute left-0 top-0 z-0 h-full w-full" />
        <Image
          className="relative z-10 rounded-lg object-cover"
          src={headshotUrl}
          layout="fill"
          alt={label}
        />
      </AspectRatio>
      <span className="text-h6">{label}</span>
    </Link>
  )
}
