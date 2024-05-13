import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './event.module.css';
import { UserContext } from "../../UserContext.jsx";
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AddReview from '../add-review/AddReview.js';


function Event() {
  const { eventId } = useParams();  //getting eventId from the eventcard.
  const { userRole, userID, isLoggedIn } = useContext(UserContext);
  const [eventData, setEventData] = useState(null);
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [numOfRSVPs, setNumOfRSVPs] = useState(0);
  const navigate = useNavigate(); // Hook to get the navigate function

  console.log("In event")
  

  //getting the event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        //getting specific event details:
        console.log("hitting the event backend")
        const url = new URL("http://localhost:3001/event/getEventById");
        url.searchParams.append('eventId', eventId);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Something went wrong!');
        }
        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error("Couldnt fetch event data", error);
      }
    }
    if(eventId) {
      fetchEventData();
    }
  }, [eventId])

  useEffect(() => {
    if (eventData && eventData.event && Array.isArray(eventData.event.RSVPs)) {
      setNumOfRSVPs(eventData.event.RSVPs.length);
    }
  }, [eventData]);
  

  //useeffect to check whether or not the attendee has already rsvped.
  useEffect(() => {
    const checkUserRSVP = async () => {
      try {
        const url = new URL(`http://localhost:3001/event/rsvpd`);
        url.searchParams.append('userId', userID); // Append userID as a query parameter
        url.searchParams.append('eventId', eventId);
  
        const response = await fetch(url);
  
        if(!response.ok) {
          throw new Error('Failed to check RSVP status');
        }
  
        const { hasRSVPd } = await response.json();
        setHasRSVPd(hasRSVPd);
        } catch(error) {
          console.error('Error during RSVP status check', error);
        }
    }

    if (isLoggedIn && userID && eventId) {
      checkUserRSVP();
    }
  }, [eventId, userID, isLoggedIn])


  //for user experience
  if(!eventData) {
    return <div>
      Loading...
    </div>
  }

  //RSVPing the user to the event here
  const handleRSVP = async () => {
    if(!isLoggedIn) {
      console.error("User must be logged in to RSVP");
      return;
    }

    const credentials = {
      "eventId": eventId,
      "userId": userID
    }

    try {
      const url = 'http://localhost:3001/event/rsvp'; 
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials), // Send eventId and userId to backend
      });

      if (!response.ok) {
        throw new Error('Failed to RSVP');
      }
      
      //updating rsvped state/
      //send user email from the backend.
      setHasRSVPd(true);
      navigate('/myevents');
    } catch (error) {
      console.error('Could not RSVP', error);
    }
  }

  //unRSVPing the user to the event here
  const handleUnRSVP = async () => {
    if(!isLoggedIn) {
      console.error("User must be logged in to RSVP");
      return;
    }

    const credentials = {
      "eventId": eventId,
      "userId": userID
    }

    try {
      const url = 'http://localhost:3001/event/UnRsvp'; 
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials), // Send eventId and userId to backend
      });

      if (!response.ok) {
        throw new Error('Failed to unRSVP');
      }
      
      //updating rsvped state/
      //send user email from the backend.
      setHasRSVPd(false);   
      navigate('/myevents');  //after unrsvping take them to the my events page.  
    } catch (error) {
      console.error('Could not RSVP', error);
    }
  }

  const handleDeleteEvent = async () => {
    if(!isLoggedIn) {
      console.error("User must be logged in to RSVP");
      return;
    }

    const payload = {
      "eventId": eventId,
      "userID": userID
    }
    
    try {
      const response = await fetch('http://localhost:3001/event/deleteEvent', {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              // Include any authentication tokens if needed
          },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
          // If the server response is not ok, throw an error
          throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data.message);
      navigate('/myevents')
    } catch (error) {
        console.error('Error deleting the event:', error);
    }
  }

  // Move to separate js file for modularity
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
    <div className={styles.eventpage}>
      <div className={styles.eventContainer}>

        <div className={styles.eventImgContainer}>
          <h1>{eventData.event.event_name}</h1>
          {eventData.event.image_url && (
            <img className={styles.eventImage} src={eventData.event.image_url} alt={eventData.event.event_name} />
          )}
        </div>

        <div className={styles.eventBodyContainer}>

          <div className={styles.eventDescLocContainer}>
            <div>
              <h2>{eventData.event.event_name}</h2>
              <p>{eventData.event.description}</p>
            </div>
            <div>
              <h2>Location:</h2>
              <p>{eventData.event.venue}</p>
            </div>
          </div>

          {/*If dates are the same, only display one. Otherwise display the start and end date. */}
          <div className={styles.eventDateContainer}>
          {eventData.event.start_date === eventData.event.end_date 
                ? `Date: ${formatDate(eventData.event.start_date)}` 
                : `Runs from: ${formatDate(eventData.event.start_date)} to ${formatDate(eventData.event.end_date)}`}
          </div>
          
          <div className={styles.buttonContainer}>
            { eventData.event.rsvp_required && !isLoggedIn && (
              <button onClick={() => navigate('/login')}>Login to RSVP for this event or review it.</button>
            )}

            {userRole === 'attendee' && eventData.event.rsvp_required && isLoggedIn && hasRSVPd === false && userID && (   //checks for displaying the rsvp button.
              <button onClick={handleRSVP}>RSVP for this event.</button>
            )}

            {userRole === 'attendee' && eventData.event.rsvp_required && isLoggedIn && hasRSVPd === true && userID && (   //checks for displaying the rsvp button.
              <button onClick={handleUnRSVP}>un-RSVP for this event.</button>
            )}

            {userRole === 'organizer' && isLoggedIn && userID === eventData.event.organizer && (
              <button onClick={() => navigate(`/edit-event/${eventId}`)}>
                Edit Event
              </button>
            )}

            {userRole === 'organizer' && isLoggedIn && userID === eventData.event.organizer && (
              <button onClick={handleDeleteEvent}>Delete Event</button>
            )}
          </div>

          <div className={styles.eventReviewsContainer}>
            {isLoggedIn && userRole === 'organizer' && userID === eventData.event.organizer && (
              <h3 style={{ textAlign: "center" }}>
                {numOfRSVPs === 1 ? `${numOfRSVPs} person has registered for your event.` : `${numOfRSVPs} people have registered for your event.`}
              </h3>
            )}
            <AddReview eventId={eventId} userID={userID} userRole={userRole}/>
            {userRole === 'organizer' && isLoggedIn && userID === eventData.event.organizer ? (
              <h3>Reviews for your Event:</h3>
            ) : (
              <h3>Reviews from Attendees:</h3>
            )}
            <ul>
              {eventData.event.reviews.map((review, index) => (
                <li key={index}>
                  <div className={styles.reviewHeader}>
                    <p className={styles.reviewUsername}>{review.username}</p>
                    <span>
                      {Array.from({ length: 5 }, (_, index) => (
                        <span key={index}>
                          {index < review.rating ? (
                            <span className={styles.reviewStar}>&#9733;</span>
                          ) : (
                            <span className={styles.reviewStar}>&#9734;</span>
                          )}
                        </span>
                      ))}
                    </span>


                  </div>
                  <p>"{review.review}"</p>
                  
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Event;
