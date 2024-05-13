// Home.js
import EventCard from '../../components/event-card/EventCard';
import styles from './home.module.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';


function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]); // Corrected setter function name
  const [error, setError] = useState(null);

  // Fetching of data from the backend
  useEffect(() => { // Fetch featured events on mount
    getFeaturedEvents();
  }, []);

  const getFeaturedEvents = async () => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/event/getEvents");
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      const json = await response.json();
      setFeaturedEvents(json.events); // Now correctly refers to the setEvents function
      console.log(json.events)
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch events:", err);
    }
  };

  return (
    <div class={styles.home}>
      <h1>Featured Events</h1>
      <div className={styles.eventlist}>
      {featuredEvents.map((event, index) => (
        <Link key={event.eventId} to={`/event/${event.eventId}`} className={styles.eventLink}>
          <EventCard key={event.eventId} event={event} />
        </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
