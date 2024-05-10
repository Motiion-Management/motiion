'use client'
import Image from 'next/image'
import placeholder from '@/public/images/upload-image-placeholder.png'
import { HeadshotsUploadButton } from '@/components/ui/headshot-upload-button'
import { SecondaryHeadshotUploadButton } from '@/components/ui/secondary-headshot-upload-button'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Button } from '@/components/ui/button'
export default function Headshot() {
  const headshots = useQuery(api.resumes.getMyHeadshots)
  const removeHeadshot = useMutation(api.resumes.removeHeadshot)

  const headshotsExist = headshots && headshots.length > 0
  return (
    <section className="grid h-full grid-cols-1 place-items-center gap-8">
      {headshotsExist ? (
        <div className="grid w-max grid-flow-col grid-rows-1 gap-4 justify-self-start overflow-x-auto">
          <SecondaryHeadshotUploadButton />
          {headshots.map((headshot) => (
            <Image
              onClick={() => removeHeadshot({ headshotId: headshot.storageId })}
              key={headshot.title || headshot.url}
              src={headshot.url || ''}
              width={100}
              height={148}
              className="rounded-lg object-cover hover:cursor-pointer"
              alt={headshot.title || 'Headshot'}
            />
          ))}
        </div>
      ) : (
        <>
          <p className="">
            Upload at least one headshot to continue setting up your account.
            Your headshot will be viewable to the public.
          </p>

          <Image
            src={placeholder}
            className="h-auto w-[256px] object-contain"
            alt="Upload Image Placeholder"
          />
        </>
      )}
      <div className="sticky bottom-0 w-full ">
        {headshotsExist ? (
          <Button onClick={() => {}} className="w-full">
            Continue
          </Button>
        ) : (
          <HeadshotsUploadButton className="w-full" />
        )}
      </div>
    </section>
  )
}
