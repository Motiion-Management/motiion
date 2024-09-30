'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Timeline,
  TimelineEventCard,
  TimelineEventSection
} from '@/components/ui/timeline'
import { api } from '@packages/backend/convex/_generated/api'
import { EventDoc } from '@packages/backend/convex/validators/events'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { zEvents } from '@packages/backend/convex/validators/events'
import { usePaginatedQuery, useMutation } from 'convex/react'
import { z } from 'zod'
import { Id } from '@packages/backend/convex/_generated/dataModel'

const ManageEvents: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof zEvents>>({
    resolver: zodResolver(
      zEvents.pick({ title: true, startDate: true, endDate: true })
    )
  })

  const onSubmit = async (data: z.infer<typeof zEvents>) => {
    await createEvent(data)
  }

  const createEvent = useMutation(api.events.create)
  const deleteEvent = useMutation(api.events.destroy)

  const handleDeleteEvent = async (eventId: Id<'events'>) => {
    await deleteEvent({ id: eventId })
  }

  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.events.paginateAdmin,
    {},
    { initialNumItems: 10 }
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

  if (results.length === 0) {
    return null
  }
  return (
    <div>
      <h2 className="text-xl font-semibold">Events</h2>
      <Timeline>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card my-8 grid grid-cols-2 gap-4 rounded-lg p-4"
        >
          <h3 className="col-span-2">Create New Event</h3>
          <input type="text" placeholder="Title" {...register('title')} />
          {errors.title && <span>{errors.title.message}</span>}

          <input
            type="date"
            placeholder="Start Date"
            {...register('startDate')}
          />
          {errors.startDate && <span>{errors.startDate.message}</span>}

          <input type="date" placeholder="End Date" {...register('endDate')} />
          {errors.endDate && <span>{errors.endDate.message}</span>}

          <button type="submit">Create Event</button>
        </form>
        <h2 className="text-h5 mb-4">Upcoming Events</h2>
        <div className="flex max-w-sm flex-col gap-4">
          {resultsByDate.map(([startDate, events], index) => (
            <TimelineEventSection key={index} startDate={new Date(startDate)}>
              {events?.map((event, eventIndex) => (
                <React.Fragment key={`${index}-${eventIndex}`}>
                  <TimelineEventCard event={event} />
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteEvent(event._id)}
                    className="w-fit"
                  >
                    Delete
                  </Button>
                </React.Fragment>
              ))}
            </TimelineEventSection>
          ))}
        </div>

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
    </div>
  )
}

export default ManageEvents
