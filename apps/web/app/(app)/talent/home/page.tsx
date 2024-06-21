import { Skeleton } from '@/components/ui/skeleton'
import { EventsList } from './events-list'

export default async function HomePage() {
  return (
    <div className="grid grid-rows-[auto_1fr] gap-8 px-2">
      <Skeleton className="h-[25dvh] w-full" />
      <EventsList />
    </div>
  )
}
