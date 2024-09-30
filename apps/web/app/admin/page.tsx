import React, { useState, useEffect } from 'react';
import { api } from 'convex/react'; // Assuming you have a Convex API setup

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', startDate: '', endDate: '' });

  useEffect(() => {
    // Fetch events from the backend
    api.events.read().then(setEvents);
  }, []);

  const handleCreateEvent = async () => {
    await api.events.create(newEvent);
    setNewEvent({ title: '', startDate: '', endDate: '' });
    const updatedEvents = await api.events.read();
    setEvents(updatedEvents);
  };

  const handleDeleteEvent = async (eventId) => {
    await api.events.destroy({ id: eventId });
    const updatedEvents = await api.events.read();
    setEvents(updatedEvents);
  };

  return (
    <div>
      <header>
        <h1>Admin Panel</h1>
        <nav>
          <ul>
            <li><a href="#users">Manage Users</a></li>
            <li><a href="#events">Manage Events</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section id="users">
          <h2>Manage Users</h2>
          {/* User management components will go here */}
        </section>
        <section id="events">
          <h2>Manage Events</h2>
          <div>
            <h3>Create New Event</h3>
            <input
              type="text"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <input
              type="date"
              placeholder="Start Date"
              value={newEvent.startDate}
              onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
            />
            <input
              type="date"
              placeholder="End Date"
              value={newEvent.endDate}
              onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
            />
            <button onClick={handleCreateEvent}>Create Event</button>
          </div>
          <ul>
            {events.map(event => (
              <li key={event._id}>
                {event.title} ({event.startDate} - {event.endDate})
                <button onClick={() => handleDeleteEvent(event._id)}>Delete</button>
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
  );
}
