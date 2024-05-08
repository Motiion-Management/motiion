import { Button } from '@/components/ui/button'
import Image from 'next/image'
import placeholder from '@/public/images/upload-image-placeholder.png'

export default function Headshot() {
  return (
    <section className="grid h-full grid-cols-1 place-items-center gap-8">
      <p className="">
        Upload at least one headshot to continue setting up your account. Your
        headshot will be viewable to the public.
      </p>
      <Image
        src={placeholder}
        className="h-auto w-[256px] object-contain"
        alt="Upload Image Placeholder"
      />
      <div className="sticky bottom-0 w-full ">
        <Button className=" col-span-2 w-full">Upload</Button>
        <input
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          type="file"
          name="headshot"
          id="headshot"
        />
      </div>
    </section>
  )
}
