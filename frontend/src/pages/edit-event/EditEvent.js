import React, { useState, useEffect } from 'react';
import { UserContext } from "../../UserContext.jsx";
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styles from './editevents.module.css';

function EditEvent() {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [status, setStatus] = useState('planning'); // Default status
    const [requireRSVP, setRequireRSVP] = useState(false);
    // const [imageFile, setImageFile] = useState();
    // const [file, setFile] = useState()
    const [imageURL, setImageUrl] = useState('');
    const { userID } = useContext(UserContext);
    const[organizerURL, setOrganizerURL] = useState('');
    const[ticketURL, setTicketURL] = useState('');
    const navigate = useNavigate(); // Hook to get the navigate function
    const { eventId } = useParams();
    

    //prefilling the form with the event data to aid the organizer in changing details.
    useEffect(() => {
        // Define the function inside the effect to fetch event data
        const fetchEventData = async () => {
            try {
                console.log("hitting the event backend")
                const url = new URL("http://localhost:3001/event/getEventById");
                url.searchParams.append('eventId', eventId);
                const response = await fetch(url);
                if (!response.ok) {
                throw new Error('Something went wrong!');
                }
                const event = await response.json();

                // Now set the state values with the fetched event data
                setEventName(event.eventName);
                setEventDescription(event.eventDescription);
                setStartTime(event.startTime);
                setEndTime(event.endTime);
                setStartDate(event.startDate);
                setEndDate(event.endDate);
                setEventLocation(event.eventLocation);
                setStatus(event.status);
                setRequireRSVP(event.requireRSVP);
                setImageUrl(event.imageURL);
                setOrganizerURL(event.organizerURL);
                setTicketURL(event.ticketURL);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        // Call the function
        fetchEventData();
    }, [eventId]);

    const handleEdit = async (e) => {
        e.preventDefault();

        const editedEvent = {
            eventId: eventId,
            event_name: eventName,
            description: eventDescription,
            start_time: startTime,
            end_time: endTime,
            start_date: startDate.split('-').reverse().join(''), // Adjust date format if necessary
            end_date: endDate.split('-').reverse().join(''), // Adjust date format if necessary
            venue: eventLocation,
            organizer: userID, // Replace with actual organizer ID
            status: status,
            time_zone: 'MST', // If you have a timezone state, use that
            rsvp_required: requireRSVP,
            RSVPs: [], // Initialize as empty or with actual data if available
            reviews: [], // Initialize as empty or with actual data if available
            image_url: imageURL,
            organizer_url: organizerURL,
            ticket_url: ticketURL
        };

        try {
            console.log("trying to hit backend", editedEvent)
            const response = await fetch("http://localhost:3001/event/editEvent", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(editedEvent),
            });
      
            if (!response.ok) {
              throw new Error('Error adding todo');
            }
            navigate('/myevents');
          } catch (err) {
            console.error(err.message);
          }
    }


    return (
        <div className={styles.editBackground}>
        <div className={styles.editevents}>
            <h1>Edit Event</h1>
                <form onSubmit={handleEdit}>
                    <div className={styles.formGroup}>
                    <label htmlFor="eventName">Event Name:</label>
                    <input type="text" id="eventName" name="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="eventDescription">Event Description:</label>
                    <textarea id="eventDescription" name="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} ></textarea>
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="startTime">Start Time:</label>
                    <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="endTime">End Time:</label>
                    <input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)}  />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="startDate">Start Date:</label>
                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="endDate">End Date:</label>
                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="location">Venue:</label>
                    <input type="text" id="location" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)}  />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="status">Status:</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                    </div>

                    <div className={styles.checkboxGroup}>
                    <label>
                        Require RSVP:
                        <input type="checkbox" checked={requireRSVP} onChange={() => setRequireRSVP(!requireRSVP)} />
                    </label>
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="imageURL">Image URL:</label>
                    <input type="text" id="imageURL" name="imageURL" value={imageURL} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="organizerUrl">Organizer URL:</label>
                    <input type="text" id="organizerUrl" name="organizerUrl" value={organizerURL} onChange={(e) => setOrganizerURL(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="ticketUrl">Ticket URL:</label>
                    <input type="text" id="ticketUrl" name="ticketUrl" value={ticketURL} onChange={(e) => setTicketURL(e.target.value)} />
                    </div>

                    <button type="Edit" className={styles.editButton}>Edit Event</button>
                    
                </form>
        </div>
        </div>
    )
}

export default EditEvent;