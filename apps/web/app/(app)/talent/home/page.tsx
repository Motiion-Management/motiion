import Image from 'next/image'
import Link from 'next/link'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { EventsList } from './events-list'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const featuredEvent = await fetchQuery(api.featuredContent.getCurrent)
  return (
    <div className="flex flex-col gap-8 px-2">
      {featuredEvent?.image && (
        <div className='grid grid-cols-2 gap-4'>
          <Link href={`${featuredEvent.link}`} className=" h-min">
            <AspectRatio ratio={123 / 180} className="relative">
              <Image
                className="rounded-lg object-cover relative z-10"

                src={featuredEvent.image}
                layout="fill"
                alt={featuredEvent.title}
              />
            </AspectRatio>
          </Link>
          <div className='flex flex-col gap-2'>
            <h2 className='text-lg font-bold text-end'>{featuredEvent.title}</h2>
            <span className='text-sm text-end'>{featuredEvent.description}</span>
            <Button asChild variant='secondary' className='self-end mt-4'>
              <Link href={`${featuredEvent.link}`}>
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      )}
      <EventsList />
    </div>
  )
}
