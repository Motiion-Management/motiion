import { FC } from 'react'
import {
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

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
  profiles: { src: string; label: string; href: string }[]
}> = ({ title, profiles }) => {
  return (
    <div className="grid gap-4">
      <h2 className="text-h5">{title}</h2>
      <Carousel opts={{ dragFree: true }} className="overflow-scroll">
        <CarouselContent className="flex gap-4">
          {profiles.map((headshot, index) => (
            <CarouselItem
              key={headshot.src + index}
              className="h-[148px] w-[100px] basis-1/4"
            >
              <Link href={headshot.href} className="grid">
                <Image
                  className="rounded-lg object-cover "
                  src={headshot.src}
                  layout="fill"
                  alt={headshot.label}
                />
                <span>{headshot.label}</span>
              </Link>
            </CarouselItem>
          )) && <ProfileSkeleton count={8} />}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
