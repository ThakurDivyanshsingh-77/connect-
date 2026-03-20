const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
      index: true,
    },
    percent: { type: Number, default: 0, min: 0, max: 100 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const mentorshipProgressSchema = new mongoose.Schema(
  {
    mentorship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentorship',
      required: true,
      unique: true,
      index: true,
    },
    goals: { type: [goalSchema], default: [] },
    overallPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MentorshipProgress', mentorshipProgressSchema);

