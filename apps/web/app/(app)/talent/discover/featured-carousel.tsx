import { FC } from 'react'
import {
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Separator } from '@/components/ui/separator'

export function ProfileSkeleton({ count = 1 }: { count?: number }) {
  return [...Array(count)].map((_, i) => (
    <CarouselItem
      key={`profile-skeleton-${i}`}
      className="h-[148px] w-[100px] basis-auto"
    >
      <Skeleton
        key={`headshot-skeleton-${i}`}
        className="h-[148px] w-[100px]"
      />
    </CarouselItem>
  ))
}
export const FeaturedCarousel: FC<{
  title: string
  profiles?: { headshotUrl: string; label: string; userId: Id<'users'> }[] | null
}> = ({ title, profiles }) => {

  if (!profiles) return null
  return (
    <div className="grid gap-4">
      <h2 className="text-h5">{title}</h2>
      <Carousel opts={{ dragFree: true }} className="overflow-scroll">
        <CarouselContent className="flex gap-4">
          {profiles.map((profile, index) => (
            <CarouselItem
              key={profile.headshotUrl + index}
              className="basis-1/3"
            >
              <Link href={`/talent/${profile.userId}`} className="">
                <AspectRatio ratio={123 / 180} className="">
                  <Image
                    className="rounded-lg object-cover "
                    src={profile.headshotUrl}
                    layout="fill"
                    alt={profile.label}
                  />
                </AspectRatio>
                <span className="text-h6">{profile.label}</span>
              </Link>
            </CarouselItem>
          )) || <ProfileSkeleton count={8} />}
        </CarouselContent>
      </Carousel>
      <Separator />
    </div>
  )
}
