'use client'
import Image from 'next/image'
import placeholder from '@/public/images/upload-image-placeholder.png'
import { HeadshotUploadButton } from '@/components/ui/headshot-upload-button'
import { HeadshotUploadSquare } from '@/components/ui/headshot-upload-square'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import {
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'
export default function Headshot() {
  const headshots = useQuery(api.resumes.getMyHeadshots)
  const removeHeadshot = useMutation(api.resumes.removeHeadshot)
  const headshotsExist = headshots && headshots.length > 0
  return (
    <section className="mt-4 grid h-full w-full grid-cols-1 grid-rows-[1fr_min-content] gap-8">
      <div className="flex flex-col items-start gap-3 ">
        {headshotsExist && (
          <>
            <div className="flex w-full justify-between">
              <h4 className="text-xl font-bold">Headshots</h4>
              <p className="text-sm">{headshots?.length || 0}/5 imported</p>
            </div>

            <Carousel opts={{ dragFree: true }} className="w-full">
              <CarouselContent visible>
                <CarouselItem className="basis-auto">
                  <HeadshotUploadSquare />
                </CarouselItem>
                {headshots.map((headshot, index) => (
                  <CarouselItem key={index} className="basis-auto">
                    <div key={index} className="relative h-[148px] w-[100px] ">
                      <X
                        onClick={() =>
                          removeHeadshot({ headshotId: headshot.storageId })
                        }
                        className="bg-input absolute -right-3 -top-3 z-10 grid place-items-center rounded-full border stroke-white p-[7px] hover:cursor-pointer"
                        strokeWidth={4}
                        size={32}
                      />
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
        <p className="">
          Upload at least one headshot to continue setting up your account. Your
          headshot(s) will be viewable to the public.
        </p>

        {!headshotsExist && (
          <Image
            src={placeholder}
            className="h-auto w-[256px] self-center  object-contain"
            alt="Upload Image Placeholder"
          />
        )}
      </div>
      <div className="sticky bottom-0 w-full ">
        {headshotsExist ? (
          <Button onClick={() => {}} className="w-full">
            Continue
          </Button>
        ) : (
          <HeadshotUploadButton className="w-full" />
        )}
      </div>
    </section>
  )
}
