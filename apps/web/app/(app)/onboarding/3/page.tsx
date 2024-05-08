'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Headshot() {
  return (
    <section className="flex max-w-sm flex-col gap-8">
      <p className="my-8">
        Upload at least one headshot to continue setting up your account. Your
        headshot will be viewable to the public.
      </p>
      <div className="flex justify-center">
        <Image
          src="/images/upload-image-placeholder.png"
          alt="Upload Image Placeholder"
          width={200}
          height={200}
        />
      </div>
      <div className="flex justify-center">
        <Button className="relative col-span-2 w-full">
          Submit
          <input
            className="absolute inset-0 cursor-pointer opacity-0"
            type="file"
            name=""
            id=""
          />
        </Button>
      </div>
    </section>
  )
}
