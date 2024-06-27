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

  type ResultGroup = [string, EventDoc[] | undefined]
  const [resultsByDate, setResultsByDate] = useState<ResultGroup[]>([])

  useEffect(() => {
    const groupedResults = Object.entries(
      results.reduce((acc: { [key: string]: EventDoc[] }, event) => {
        const key = event.startDate // extract the startDate as key
        if (!acc[key]) {
          acc[key] = [] // initialize an empty array if key doesn't exist
        }
        acc[key].push(event) // push the event into the corresponding array
        return acc // return the accumulator for the next iteration
      }, {})
    )

    setResultsByDate(groupedResults)
  }, [results])

  if (results.length === 0) {
    return null
  }
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
