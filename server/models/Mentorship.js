const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'ended'],
      default: 'pending',
      index: true,
    },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

mentorshipSchema.index({ mentor: 1, mentee: 1 }, { unique: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema);

