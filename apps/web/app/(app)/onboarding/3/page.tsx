'use client'


import { Button } from '@/components/ui/button'
import Image from 'next/image'




export default function Headshot() {
  
  return (
    <section className='flex flex-col gap-8 max-w-sm'>
    <p className='my-8'>Upload at least one headshot to continue setting up your account. Your headshot will be viewable to the public.</p>
     <div className = "flex justify-center">
        <Image
          src="/images/upload-image-placeholder.png"
          alt="Upload Image Placeholder"
          width={200}
          height={200}
        />
        </div>
        <div className="flex justify-center">
          <Button className="col-span-2 w-full">
            Submit
            <input className='opacity-0 absolute inset-0 cursor-pointer' type="file" name="" id="" />
          </Button>
        </div>
    </section>
  )
}
