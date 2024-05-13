import React, { useState, useEffect } from 'react';
import styles from './myevents.module.css';
import EventCard from '../../components/event-card/EventCard';
import { UserContext } from "../../UserContext.jsx";
import { useContext } from 'react';
import { Link } from 'react-router-dom';

function MyEvents() {
  console.log("in the events component");

  // Corrected state management for this component
  const [events, setEvents] = useState([]); // Corrected setter function name
  const [error, setError] = useState(null);
  const { userID, userRole } = useContext(UserContext);   //global state from context api

  // Fetching of data from the backend
  useEffect(() => { // Fetch events on mount
    getMyEvents();
  }, []);

  const getMyEvents = async () => {
    setError(null);
    try {
      console.log(typeof(userID))
      const url = new URL(`http://localhost:3001/event/getUserEvents`);
      url.searchParams.append('userID', userID); // Append userID as a query parameter
      //adding the userRole while sending to the backend.
      //the backend will return the events based on the role.
      //if role = attendee, itll go through multiple events and check their RSVP lists
      //if role = organizer, itll go through multiple events and check their organizer
      url.searchParams.append('userRole', userRole);

      const response = await fetch(url);
      console.log(url)
      console.log(response)
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      const json = await response.json();
      console.log(json.userEvents);
      setEvents(json.userEvents); // Now correctly refers to the setEvents function
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch events:", err);
    }
  };

  return (
    <div className={styles.myevents}>
      <div className={styles.topRow}>
        <h1>My Events</h1>
      </div>
      <div className={styles.eventlist}>
      {events.map((event, index) => (
        <Link key={event.eventId} to={`/event/${event.eventId}`} className={styles.eventLink}>
          <EventCard key={event.eventId} event={event} />
        </Link>
        ))}
      </div>
      {/* Error handling display */}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </div>
  );
}

export default MyEvents;