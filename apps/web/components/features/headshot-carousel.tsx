'use client'
import Image, { StaticImageData } from 'next/image'
import { HeadshotUploadSquare } from '@/components/ui/headshot-upload-square'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { X } from 'lucide-react'
import {
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'

export function HeadshotCarousel({
  title,
  placeholderText,
  placeholderImage,
  onboarding
}: {
  title: string
  placeholderText?: string
  placeholderImage?: StaticImageData
  onboarding?: boolean
}) {
  const headshots = useQuery(api.resumes.getMyHeadshots)
  const removeHeadshot = useMutation(api.resumes.removeHeadshot)
  const headshotsExist = headshots && headshots.length > 0

  //wrap this in a grid to prevent overflow
  return (
    <div className="flex flex-col items-start gap-3 ">
      {headshotsExist && (
        <>
          <div className="flex w-full justify-between">
            <h4 className="text-h4 text-secondary dark:text-foreground">
              {title}
            </h4>
            <p className="text-body-xs">{headshots?.length || 0}/5 imported</p>
          </div>

          <Carousel opts={{ dragFree: true }} className="w-full">
            <CarouselContent visible>
              {headshots.length < 5 && (
                <CarouselItem className="basis-auto">
                  <HeadshotUploadSquare />
                </CarouselItem>
              )}
              {headshots.map((headshot, index) => (
                <CarouselItem key={index} className="basis-auto">
                  <div key={index} className="relative h-[148px] w-[100px] ">
                    {onboarding && (
                      <X
                        onClick={() =>
                          removeHeadshot({ headshotId: headshot.storageId })
                        }
                        className="bg-input absolute -right-3 -top-3 z-10 grid place-items-center rounded-full border stroke-white p-[7px] hover:cursor-pointer"
                        strokeWidth={4}
                        size={32}
                      />
                    )}
                    <Image
                      key={headshot.title || headshot.url}
                      src={headshot.url || ''}
                      layout="fill"
                      className="rounded-lg object-cover"
                      alt={headshot.title || 'Headshot'}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </>
      )}
      <p className="text-body">{placeholderText}</p>
      {!headshotsExist && placeholderImage && (
        <Image
          src={placeholderImage}
          className="h-auto w-[256px] self-center  object-contain"
          alt="Upload Image Placeholder"
        />
      )}
    </div>
  )
}
