import React from 'react';
import styles from './event-card.module.css';

function EventCard({ event }) {
  console.log("in event card");

  function formatDate(dateString) {
    if (/^\d{8}$/.test(dateString)) {
      const day = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const year = dateString.substring(4, 8);
      
      const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
      
      const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
      
      return date.toLocaleDateString(undefined, options);
    } else {
      return 'Invalid Date';
    }
  }  
  
  return (
    <div className={styles.eventCard}>
      {event.image_url && (
        <div className={styles.eventImage}>
          <img src={event.image_url} alt={event.event_name} />
        </div>
      )}
      <div className={styles.eventInfo}>
        <h2>{event.event_name}</h2>
        <p>Start Date: {formatDate(event.start_date)}</p>
        <p>End Date: {formatDate(event.end_date)}</p>
        <p>Location: {event.venue}</p>
      </div>
    </div>
  );
}

export default EventCard;
