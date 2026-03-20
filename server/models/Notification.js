const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  type: {
    type: String,
    enum: [
      'message',
      'connection_request',
      'job_update',
      'event_reminder',
      'verification_status',
      'mentorship_request',
      'mentorship_approved',
      'mentorship_rejected',
      'room_message',
      'room_announcement'
    ],
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    default: '/',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
    default: null,
  },
  dedupeKey: {
    type: String,
    default: undefined,
    unique: true,
    sparse: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
