const { Router } = require("express");
const router = Router();
const { Event, User } = require("../db/index.js");
const { sendEmail } = require('../mail/mailer');

router.get("/getEvents", async(req, res) => {
    console.log("Getting events from backend");

    const events = await Event.find();

    //remapping the _id field to eventID to prevent issues in the frontend.
    const remappedEvents = events.map(event => ({
        eventId: event._id,
        // Spread the rest of the event object properties
        ...event.toObject(),
    }));

    res.status(200).json({
        "events": remappedEvents
    })
})

router.get('/getEventById', async(req, res) => {
    try {
        const eventId = req.query.eventId;

        if(!eventId) {
            return res.status(400).json({message: "No event ID provided."})
        }

        const event = await Event.findById(eventId);

        if(!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({
            "event": event
        })
    } catch(error) {
        console.error("Error finding event: ", error);
        res.status(500).json({message: "Error finding event"});
    }
})


router.get("/getUserEvents", async (req, res) => {
    try {
        const { userID, userRole } = req.query;
        let userEvents = [];

        if (!userID || !userRole) {
            return res.status(400).json({ message: "UserID and UserRole are required." });
        }

        if(userRole === 'organizer') {
            userEvents = await Event.find({ organizer: userID });
        } else if (userRole === 'attendee') {
            userEvents = await Event.find({
                RSVPs: { $elemMatch: { user: userID } }
            });
        } else {
            return res.status(400).json({ message: "Invalid or unspecified user role." });
        }

        const remappedEvents = userEvents.map(event => ({
            eventId: event._id,
            // Spread the rest of the event object properties
            ...event.toObject(),
        }));

        //returning if successful
        res.status(200).json({
            "userEvents": remappedEvents
        });
    } catch(error) {
        console.error("Error fetching user events:", error);
        res.status(500).json({ message: "Error fetching events for user." });
    }
})

router.put("/rsvp", async (req, res) =>{

    try {
        let { eventId, userId } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $addToSet: {RSVPs: { user: userId } }
            },
            {new: true}
        );
        
        console.log(updatedEvent)

        //adding email logic to send user RSVP notification
        if(updatedEvent) {
            const user = await User.findById(userId);
            if (user && user.email) {
                const subject = 'Event RSVP Confirmation';
                const textBody = `Hello, you have successfully RSVPed to the event. Event details: ${updatedEvent.event_name}. Login to your EventSphere account and go to My Events for more details`;

                await sendEmail(user.email, subject, textBody);
                res.status(200).json({ success: true, message: 'RSVP updated and confirmation email sent', updatedEvent });
            } else {
                res.status(200).json({ success: true, message: 'RSVP updated but no email was sent', updatedEvent });
            }
        } else {
            res.status(400).json({ success: false, message: 'Server error', error: error.message });
        }
    } catch(error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
})

router.put('/UnRsvp', async(req, res) => {
    console.log("unRSVPing a user to an event.");

    try {
        let { eventId, userId } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $pull: {RSVPs: { user: userId } }
            },
            {new: true}
        );
    
        if(updatedEvent) {
            const user = await User.findById(userId);
            if (user && user.email) {
                const subject = 'Event unRSVP Confirmation';
                const textBody = `Hello, you have successfully unRSVPed to the event. Event details: ${updatedEvent.event_name}. Login to your EventSphere account and go to My Events for more details`;

                await sendEmail(user.email, subject, textBody);
                res.status(200).json({ success: true, message: 'unRSVP updated and confirmation email sent', updatedEvent });
            } else {
                res.status(200).json({ success: true, message: 'unRSVP updated but no email was sent', updatedEvent });
            }
        } else {
            res.status(400).json({ success: false, message: 'Server error', error: error.message });
        }
    } catch(error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
})


router.get("/rsvpd", async (req, res) => {
    const { userId, eventId } = req.query;

    try {
        if(!userId || !eventId) {
            return res.status(400).send({"message": 'Missing userId or eventId'});
        }
    
        const event = await Event.findById(eventId).exec();
    
        if (!event) {
            return res.status(404).send('Event not found');
        }
        
        let userFound = false;

        for (let i = 0; i < event.RSVPs.length; i++) {
            if(event.RSVPs[i].user == userId) {
                userFound = true;
                break
            }
        }

        const hasRSVPd = userFound;
          
        res.json({ hasRSVPd });
    } catch (error) {
        console.error('Server Error', error);
        res.status(500).send('Internal Server Error');
    }
})

router.post("/addEvent", async (req, res) => {

    const payLoad = req.body;

    try {
        const newEvent = await Event.create({
            event_name: payLoad.event_name,
            description: payLoad.description,
            start_time: payLoad.start_time,
            end_time: payLoad.end_time,
            start_date: payLoad.start_date,
            end_date: payLoad.end_date,
            venue: payLoad.venue,
            organizer: payLoad.organizer, // This expects an ObjectId of the User
            status: payLoad.status,
            rsvp_required: payLoad.rsvp_required,
            RSVPs: payLoad.RSVPs.map(rsvp => ({
                user: rsvp.user, // ObjectId of the User
                status: rsvp.status
            })),
            reviews: payLoad.reviews.map(review => ({
                reviewer: review.reviewer, // ObjectId of the User
                review: review.review,
                rating: review.rating
            })),
            image_url: payLoad.image_url,
            organizer_url: payLoad.organizer_url,
            ticket_url: payLoad.ticket_url
        });

        const organizer = await User.findById(payLoad.organizer);

        if (!organizer) {
            return res.status(404).json({ msg: "Organizer not found" });
        }

        const organizerEmail = organizer.email;

        //the mail body
        const subject = "Event Creation Confirmation";
        const textBody = `Hello,\n\nYour event "${payLoad.event_name}" has been created successfully.\n\nEvent Details:\n- Start: ${payLoad.start_date} at ${payLoad.start_time}\n- End: ${payLoad.end_date} at ${payLoad.end_time}\n- Venue: ${payLoad.venue}\n\nThank you for using our platform.`;

        //send mail logic
        await sendEmail(organizerEmail, subject, textBody);

        res.status(200).json({
            msg: "Event created successfully",
            eventId: newEvent._id
        });
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({
            msg: "Failed to create event",
            error: error.message
        });
    }
})

router.put('/editEvent', async(req, res) => {
    console.log('Inside edit events.')
    const {
        eventId,
        event_name,
        description,
        start_time,
        end_time,
        start_date,
        end_date,
        venue,
        organizer,
        status,
        rsvp_required,
        image_url,
        organizer_url,
        ticket_url
    } = req.body;

    if (!eventId) {
        return res.status(400).json({ message: "Event ID must be provided" });
    }
    
    try {
        const updatedEvent = await Event.findOneAndUpdate(
            {_id: eventId},
            {
                event_name,
                description,
                start_time,
                end_time,
                start_date,
                end_date,
                venue,
                organizer,
                status,
                rsvp_required,
                image_url,
                organizer_url,
                ticket_url
            },
            { new: true, runValidators: true }
        ).populate('RSVPs.user');

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        const organizerDetails = await User.findById(organizer); // Assuming organizer is an ID
        console.log(organizerDetails);

        if (organizerDetails) {
            const organizerSubject = "Your event has been updated";
            const organizerTextBody = `Hello, your event "${updatedEvent.event_name}" has been updated.\n\nPlease review the changes.`;
            await sendEmail(organizerDetails.email, organizerSubject, organizerTextBody);
        }

        // Notify all users who have RSVPed
        const attendeeSubject = `Update: ${updatedEvent.event_name}`;
        const attendeeTextBody = `Hello, there have been updates to the event "${updatedEvent.event_name}" you RSVPed to.\n\nPlease check the event details for the latest information.`;

        console.log(updatedEvent.RSVPs)

        // Assuming each RSVP has a reference to a User document with an email
        updatedEvent.RSVPs.forEach(async (rsvp) => {
            console.log('Inside the for loop')
            console.log(rsvp);
            console.log(rsvp.user.email);
            const userEmail = rsvp.user.email; // Accessed from the populated RSVPs
            await sendEmail(userEmail, attendeeSubject, attendeeTextBody);
        });

        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error('Error updating the event:', error);
        res.status(500).json({ message: 'Error updating the event', error: error.message });
    }
})

router.put('/review', async (req, res) => {
    const { eventId, userId, reviewText, rating } = req.body;

    try {
        // Find the event to see if the user has already submitted a review
        const event = await Event.findById(eventId);
        const user = await User.findById(userId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if the user has already reviewed the event
        const existingReviewIndex = event.reviews.findIndex(review => review.reviewer.equals(userId));

        if (existingReviewIndex > -1) {
            // Update existing review
            event.reviews[existingReviewIndex].review = reviewText;
            event.reviews[existingReviewIndex].rating = rating;
            event.reviews[existingReviewIndex].username = user.username;
        } else {
            // Add a new review
            event.reviews.push({ reviewer: userId,  username: user.username, review: reviewText, rating: rating });
        }

        // Save the updated event document
        const updatedEvent = await event.save();

        res.status(200).json({ message: "Review updated successfully", updatedEvent });
    } catch (error) {
        console.error('Error updating the review:', error);
        res.status(500).json({ message: 'Error updating the review', error: error.message });
    }
})

router.delete('/deleteEvent', async (req, res) => {
    const {userID, eventId} = req.body;

    try {
        // First, find the event to ensure it exists and to check the organizer's ID
        const eventToDelete = await Event.findById(eventId).populate('RSVPs.user', 'email');;

        if (!eventToDelete) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if the requesting user is the organizer of the event
        if (eventToDelete.organizer.toString() !== userID) {
            // Respond with an unauthorized error if the user is not the organizer
            return res.status(403).json({ message: "User is not authorized to delete this event" });
        }

        const RSVPedUsers = eventToDelete.RSVPs;

        // Email content
        const subject = "Event Cancelled";
        const textBody = `We regret to inform you that the event '${eventToDelete.event_name}' has been cancelled. We apologize for any inconvenience this may cause.`;

        // Send an email to all RSVPed users
        const emailPromises = RSVPedUsers.map(rsvp => {
            const userEmail = rsvp.user.email; // Assuming the email is populated
            return sendEmail(userEmail, subject, textBody);
        });

        // Wait for all emails to be sent before deleting the event
        await Promise.all(emailPromises);

        // If the user is the organizer, delete the event
        await Event.findByIdAndDelete(eventId);

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error('Error deleting the event:', error);
        res.status(500).json({ message: 'Error deleting the event', error: error.message });
    }
})

module.exports = router;

