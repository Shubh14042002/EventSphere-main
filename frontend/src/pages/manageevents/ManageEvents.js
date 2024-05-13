import React, { useState, useEffect } from 'react';
import styles from './manageevents.module.css';
import EventCard from '../../components/event-card/EventCard';
import { UserContext } from "../../UserContext.jsx";
import { useContext } from 'react';

function ManageEvents() {
  console.log("in the manage events component");

  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const { userID } = useContext(UserContext); // Global state

  // Fetching of data from the backend
  useEffect(() => { // Fetch events on mount
    getManagedEvents();
  }, []);

  const getManagedEvents = async () => {
    setError(null);
    try {
      console.log(typeof(userID))
      const url = new URL(`http://localhost:3001/event/getManagedEvents`);
      url.searchParams.append('userID', userID); // Append userID as a query parameter for events they manage

      const response = await fetch(url);
      console.log(url)
      console.log(response)
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      const json = await response.json();
      console.log(json.userEvents);
      setEvents(json.userEvents);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch events:", err);
    }
  };

  return (
    <div className={styles.manageevents}>
        <h1>Manage Events</h1>
        <div className={styles.eventlist}>
        {events.map((event, index) => (
            <EventCard key={index} event={event} />
        ))}
        </div>
        {/* Error handling display */}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </div>
  );
}

export default ManageEvents;
