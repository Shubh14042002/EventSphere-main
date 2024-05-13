const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:LYDHCmW2RrFiaWW7@cluster0.kw0emyr.mongodb.net/EventSphere');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    full_name: String,
    role: {
      type: String,
      enum: ['attendee', 'organizer'],
      required: true
    }
});

const eventSchema = new mongoose.Schema({
  event_name: { type: String, required: true },
  description: { type: String },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  venue: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, required: true, enum: ['planning', 'active', 'completed'] },
  rsvp_required: { type: Boolean },
  RSVPs: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  reviews: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', _id: false},
    username: {type: String},
    review: { type: String },
    rating: { type: Number, min: 1, max: 5 }
  }],
  image_url: { type: String },
  organizer_url: { type: String },
  ticket_url: { type: String}
});

const passwordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resetCode: {
    type: String,
    required: true
  },
  expiration: {
    type: Date,
    required: true
  }
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = {
    User,
    Event,
    PasswordReset
}