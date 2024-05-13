const request = require('supertest');
const app = require('../app'); // Adjust the path to your app's structure
const { Event } = require('../db/index.js');

jest.mock('../db/index.js', () => ({
    Event: {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    },
    User: {
      findById: jest.fn(),
    },
  }));
  
jest.mock('../mail/mailer', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}));

describe('Events API', () => {
  describe('GET /event/getEvents', () => {
    it('should return a list of events with status 200', async () => {
      // Mock the Event.find method to return a list of events
      Event.find.mockResolvedValue([
        { _id: '1', name: 'Event 1', toObject: () => ({ eventId: '1', name: 'Event 1' }) },
        { _id: '2', name: 'Event 2', toObject: () => ({ eventId: '2', name: 'Event 2' }) },
      ]);

      const response = await request(app).get('/event/getEvents');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body.events).toHaveLength(2);
    });
  });

  describe('GET /event/getEventById', () => {
    it('should return an event for a valid event ID with status 200', async () => {
      const mockEvent = { _id: '1', name: 'Event 1', toObject: () => ({ eventId: '1', name: 'Event 1' }) };
      Event.findById.mockResolvedValue(mockEvent);

      const validEventId = '1'; // Use an actual event ID suitable for your test setup
      const response = await request(app).get(`/event/getEventById?eventId=${validEventId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('event');
      expect(response.body.event.name).toBe('Event 1');
    });

    it('should return 400 if no event ID is provided', async () => {
      const response = await request(app).get('/event/getEventById');
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'No event ID provided.');
    });
  });

  // Additional tests for other endpoints can follow the same pattern
});
  
describe('PUT /event/rsvp', () => {
    it('should successfully RSVP a user to an event and return status 200', async () => {
      const rsvpPayload = {
        eventId: '123',
        userId: 'user123',
      };
  
      Event.findByIdAndUpdate.mockResolvedValue({
        _id: '123',
        RSVPs: [{ user: 'user123' }],
        // Assume the method correctly updates the event
      });
  
      const response = await request(app)
        .put('/event/rsvp')
        .send(rsvpPayload);
  
      expect(response.statusCode).toBe(200);
      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
        rsvpPayload.eventId,
        { $addToSet: { RSVPs: { user: rsvpPayload.userId } } },
        { new: true },
      );
      expect(response.body).toHaveProperty('success', true);
    });
});

