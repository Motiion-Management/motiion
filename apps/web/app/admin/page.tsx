'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { zEvents } from '@packages/backend/convex/validators/events'
import { usePaginatedQuery, useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

export default function AdminPage() {
  const {
    results: events,
    status,
    isLoading,
    loadMore
  } = usePaginatedQuery(api.events.paginate, {}, { initialNumItems: 10 })
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof zEvents>>({
    resolver: zodResolver(zEvents.pick({ title: true, startDate: true, endDate: true }))
  })

  const onSubmit = async (data: z.infer<typeof zEvents>) => {
    await createEvent(data)
  }

  const createEvent = useMutation(api.events.create)
  const deleteEvent = useMutation(api.events.destroy)


  const handleDeleteEvent = async (eventId) => {
    await deleteEvent({ id: eventId })
  }

  return (
    <div>
      <header>
        <h1>Admin Panel</h1>
        <nav>
          <ul>
            <li>
              <a href="#users">Manage Users</a>
            </li>
            <li>
              <a href="#events">Manage Events</a>
            </li>
            <li>
              <a href="#settings">Settings</a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section id="users">
          <h2>Manage Users</h2>
          {/* User management components will go here */}
          {status === 'CanLoadMore' && (
            <div className="flex justify-end">
              <button onClick={() => loadMore(10)} disabled={isLoading}>
                Load More Events
              </button>
            </div>
          )}
        </section>
        <section id="events">
          <h2>Manage Events</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
              <h3>Create New Event</h3>
              <input
                type="text"
                placeholder="Title"
                {...register('title')}
              />
              {errors.title && <span>{errors.title.message}</span>}
              
              <input
                type="date"
                placeholder="Start Date"
                {...register('startDate')}
              />
              {errors.startDate && <span>{errors.startDate.message}</span>}
              
              <input
                type="date"
                placeholder="End Date"
                {...register('endDate')}
              />
              {errors.endDate && <span>{errors.endDate.message}</span>}
              
              <button type="submit">Create Event</button>
          </form>
          <ul>
            {events.map((event) => (
              <li key={event._id}>
                {event.title} ({event.startDate} - {event.endDate})
                <button onClick={() => handleDeleteEvent(event._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section id="settings">
          <h2>Settings</h2>
          {/* Settings management components will go here */}
        </section>
      </main>
    </div>
  )
}
