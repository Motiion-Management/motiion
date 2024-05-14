import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import Image from 'next/image'
import {
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'
import { UserDoc } from '@packages/backend/convex/users'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export async function ProfileCard({ user }: { user: UserDoc }) {
  const token = await getAuthToken()
  const headshots = await fetchQuery(api.resumes.getMyHeadshots, {}, { token })

  return (
    <div className="relative grid">
      <div className="text-primary-foreground absolute left-4 top-4 z-10 flex flex-col">
        <div className="text-xl">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-lg">{user.location?.city}</div>
      </div>

      <Carousel className="absolute left-0 top-0 w-full">
        <CarouselContent>
          {headshots.map((headshot, index) => (
            <CarouselItem key={index} className="w-full basis-auto">
              <AspectRatio
                key={index}
                ratio={24 / 41}
                className="w-full"
                id="ar"
              >
                <Image
                  key={headshot.title || headshot.url}
                  src={headshot.url || ''}
                  width={400}
                  height={600}
                  className="h-full w-full rounded-lg object-cover"
                  alt={headshot.title || 'Headshot'}
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
