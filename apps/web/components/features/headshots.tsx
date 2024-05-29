'use client'

import { api } from '@packages/backend/convex/_generated/api'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { CarouselItem } from '../ui/carousel'
import { HeadshotUploadSquare } from '../ui/headshot-upload-square'
import Image, { StaticImageData } from 'next/image'
import { X } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

export function Headshots({
  preloadedHeadshots,
  onboarding,
  ItemComponent = CarouselItem
}: {
  preloadedHeadshots: Preloaded<typeof api.resumes.getMyHeadshots>
  onboarding?: boolean
  ItemComponent?: typeof CarouselItem | React.FC
}) {
  const headshots = usePreloadedQuery(preloadedHeadshots)
  const removeHeadshot = useMutation(api.resumes.removeHeadshot)

  return (
    <div className="flex gap-2">
      {headshots && headshots.length > 0 && headshots.length < 5 && (
        <ItemComponent className="basis-auto">
          <HeadshotUploadSquare />
        </ItemComponent>
      )}
      {headshots.map((headshot, index) => (
        <ItemComponent
          key={index}
          className="relative h-[148px] w-[100px] basis-auto "
        >
          <div className="bg-primary/50 absolute left-0 top-0 z-0 h-full w-full animate-pulse rounded-lg" />
          {onboarding && (
            <X
              onClick={() => removeHeadshot({ headshotId: headshot.storageId })}
              className="bg-input absolute -right-3 -top-3 z-10 grid place-items-center rounded-full border stroke-white p-[7px] hover:cursor-pointer"
              strokeWidth={4}
              size={32}
            />
          )}
          <Image
            data-loaded="false"
            onLoad={(event) => {
              event.currentTarget.setAttribute('data-loaded', 'true')
            }}
            className="rounded-lg object-cover "
            key={headshot.title || headshot.url}
            src={headshot.url || ''}
            layout="fill"
            alt={headshot.title || 'Headshot'}
          />
        </ItemComponent>
      ))}
    </div>
  )
}

export function HeadshotCount({
  preloadedHeadshots
}: {
  preloadedHeadshots: Preloaded<typeof api.resumes.getMyHeadshots>
}) {
  const headshots = usePreloadedQuery(preloadedHeadshots)
  return <p className="text-body-xs">{headshots?.length || 0}/5 imported</p>
}

export function HeadshotPlaceholder({
  preloadedHeadshots,
  placeholderText,
  placeholderImage,
  placeholderSlot
}: {
  preloadedHeadshots: Preloaded<typeof api.resumes.getMyHeadshots>
  placeholderText?: string
  placeholderImage?: StaticImageData
  placeholderSlot?: React.ReactNode
}) {
  const headshots = usePreloadedQuery(preloadedHeadshots)
  const headshotsExist = headshots && headshots.length > 0
  return (
    <>
      {!headshotsExist && placeholderSlot}
      {placeholderText && <p className="text-body my-3">{placeholderText}</p>}
      {!headshotsExist && placeholderImage && (
        <Image
          src={placeholderImage}
          className="h-auto w-[256px] self-center  object-contain"
          alt="Upload Image Placeholder"
        />
      )}
    </>
  )
}

export function HeadshotSkeleton({ count = 1 }: { count?: number }) {
  return [...Array(count)].map((_, i) => (
    <Skeleton key={`headshot-skeleton-${i}`} className=" h-[148px] w-[100px]" />
  ))
}