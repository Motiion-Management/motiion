import { Skeleton } from '@/components/ui/skeleton'
import { EventsList } from './events-list'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export default async function HomePage() {
  return (
    <div className="flex flex-col gap-8 px-2">
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="h-full max-h-[25dvh] w-full" />
      </AspectRatio>
      <EventsList />
    </div>
  )
}
