'use client'
import { Button } from '@/components/ui/button'
import {
  Timeline,
  TimelineEventCard,
  TimelineEventSection
} from '@/components/ui/timeline'
import { api } from '@packages/backend/convex/_generated/api'
import { EventDoc } from '@packages/backend/convex/validators/events'
import { usePaginatedQuery } from 'convex/react'
import { FC, useEffect, useState } from 'react'

export const EventsList: FC = () => {
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.events.paginate,
    {},
    { initialNumItems: 5 }
  )

  const [resultsByDate, setResultsByDate] = useState<
    [string, EventDoc[] | undefined][]
  >([])

  useEffect(() => {
    const groupedResults = Object.entries(
      Object.groupBy(results, ({ startDate }) => startDate)
    )

    setResultsByDate(groupedResults)
  }, [results])

  return (
    <Timeline>
      <h2 className="text-h5 mb-4">Upcoming Events</h2>
      {resultsByDate.map(([startDate, events], index) => (
        <TimelineEventSection key={index} startDate={new Date(startDate)}>
          {events?.map((event, eventIndex) => (
            <TimelineEventCard event={event} key={`${index}-${eventIndex}`} />
          ))}
        </TimelineEventSection>
      ))}

      {status === 'CanLoadMore' && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            loading={isLoading}
            onClick={() => loadMore(5)}
            className=""
          >
            Load More Events
          </Button>
        </div>
      )}
    </Timeline>
  )
}
